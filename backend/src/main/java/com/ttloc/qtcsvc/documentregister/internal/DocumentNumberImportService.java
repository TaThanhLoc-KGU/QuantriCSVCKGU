package com.ttloc.qtcsvc.documentregister.internal;

import com.ttloc.qtcsvc.documentregister.Direction;
import com.ttloc.qtcsvc.documentregister.DocumentNumber;
import com.ttloc.qtcsvc.documentregister.DocumentType;
import com.ttloc.qtcsvc.identity.CurrentUser;
import org.springframework.batch.core.job.Job;
import org.springframework.batch.core.job.JobExecution;
import org.springframework.batch.core.job.JobExecutionException;
import org.springframework.batch.core.job.builder.JobBuilder;
import org.springframework.batch.core.job.parameters.JobParameters;
import org.springframework.batch.core.job.parameters.JobParametersBuilder;
import org.springframework.batch.core.launch.JobLauncher;
import org.springframework.batch.core.repository.JobRepository;
import org.springframework.batch.core.step.StepExecution;
import org.springframework.batch.core.step.builder.StepBuilder;
import org.springframework.batch.infrastructure.item.support.ListItemReader;
import org.springframework.stereotype.Service;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;

/**
 * Xem truoc (preview) + nhap that (commit) file Excel so van ban hang loat.
 * Preview chi doc + kiem tra, khong ghi DB. Commit chay 1 Spring Batch Job
 * (chunk-oriented, fault-tolerant/skip loi tung dong) de ghi cac dong hop le.
 */
@Service
class DocumentNumberImportService {

    private static final int CHUNK_SIZE = 20;

    private final DocumentNumberExcelParser parser;
    private final DocumentTypeService documentTypeService;
    private final DocumentNumberRepository repository;
    private final JobRepository jobRepository;
    private final PlatformTransactionManager transactionManager;
    private final JobLauncher jobLauncher;

    DocumentNumberImportService(DocumentNumberExcelParser parser, DocumentTypeService documentTypeService,
                                 DocumentNumberRepository repository, JobRepository jobRepository,
                                 PlatformTransactionManager transactionManager, JobLauncher jobLauncher) {
        this.parser = parser;
        this.documentTypeService = documentTypeService;
        this.repository = repository;
        this.jobRepository = jobRepository;
        this.transactionManager = transactionManager;
        this.jobLauncher = jobLauncher;
    }

    ImportPreviewResult preview(Long documentTypeId, int year, MultipartFile file) {
        DocumentType type = documentTypeService.get(documentTypeId);
        DocumentNumberExcelParser.ParseResult parsed = parseFile(file, type.direction() == Direction.INCOMING);

        List<ImportPreviewRow> rows = new ArrayList<>();
        for (var e : parsed.errors()) {
            rows.add(new ImportPreviewRow(e.rowNumber(), null, null, null, false, e.message()));
        }
        for (var r : parsed.rows()) {
            boolean duplicate = repository.existsByDocumentTypeIdAndYearAndNumberInt(type.id(), year, r.numberInt());
            rows.add(new ImportPreviewRow(r.rowNumber(), r.numberInt(), r.issueDate().toString(), r.title(), duplicate, null));
        }
        rows.sort(Comparator.comparingInt(ImportPreviewRow::rowNumber));

        long errorRows = rows.stream().filter(x -> x.error() != null).count();
        return new ImportPreviewResult(rows.size(), (int) (rows.size() - errorRows), (int) errorRows, rows);
    }

    ImportResult commit(CurrentUser currentUser, Long documentTypeId, int year, MultipartFile file) {
        DocumentType type = documentTypeService.get(documentTypeId);
        DocumentNumberExcelParser.ParseResult parsed = parseFile(file, type.direction() == Direction.INCOMING);

        List<ImportRowError> errors = new ArrayList<>();
        parsed.errors().forEach(e -> errors.add(new ImportRowError(e.rowNumber(), e.message())));

        Instant now = Instant.now();
        List<DocumentNumber> candidates = parsed.rows().stream()
                .map(r -> new DocumentNumber(null, type.id(), year, r.numberInt(),
                        String.format("%02d/%s", r.numberInt(), type.symbolCode()),
                        r.title(), r.person(), r.issueDate(), r.note(),
                        r.senderUnit(), r.originalRef(), r.receivedDate(),
                        currentUser.id(), now, null, null, null, null, null))
                .toList();

        if (candidates.isEmpty()) {
            return new ImportResult("NO_VALID_ROWS", 0, 0, parsed.errors().size(), errors);
        }

        JobExecution execution = runImportJob(candidates);

        long readCount = execution.getStepExecutions().stream().mapToLong(StepExecution::getReadCount).sum();
        long writeCount = execution.getStepExecutions().stream().mapToLong(StepExecution::getWriteCount).sum();
        long batchSkipCount = execution.getStepExecutions().stream().mapToLong(StepExecution::getSkipCount).sum();

        return new ImportResult(execution.getStatus().toString(), readCount, writeCount,
                batchSkipCount + parsed.errors().size(), errors);
    }

    /**
     * Dung dynamic Job/Step: du lieu da parse xong trong bo nho (list nho, vai
     * tram dong la cung), reader dong goi thang list nay - khong can doc lai
     * tu file trong Step. Moi lan goi la 1 Job rieng (runId random) vi Spring
     * Batch chan chay lai job trung JobParameters.
     */
    private JobExecution runImportJob(List<DocumentNumber> candidates) {
        var step = new StepBuilder("documentNumberImportStep", jobRepository)
                .<DocumentNumber, DocumentNumber>chunk(CHUNK_SIZE, transactionManager)
                .reader(new ListItemReader<>(candidates))
                .writer(chunk -> repository.saveAll(chunk.getItems()))
                .faultTolerant()
                .skipLimit(candidates.size())
                .skip(Exception.class)
                .build();

        Job job = new JobBuilder("documentNumberImportJob", jobRepository)
                .start(step)
                .build();

        JobParameters params = new JobParametersBuilder()
                .addString("runId", UUID.randomUUID().toString())
                .toJobParameters();

        try {
            return jobLauncher.run(job, params);
        } catch (JobExecutionException e) {
            throw new IllegalStateException("Chay Spring Batch Job nhap Excel that bai", e);
        }
    }

    private DocumentNumberExcelParser.ParseResult parseFile(MultipartFile file, boolean incoming) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Chua chon file Excel de nhap");
        }
        try {
            return parser.parse(file.getInputStream(), incoming);
        } catch (IOException e) {
            throw new IllegalStateException("Khong doc duoc file upload", e);
        }
    }

}
