package com.ttloc.qtcsvc.report.internal;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.genai.Client;
import com.ttloc.qtcsvc.settings.SettingKeys;
import com.ttloc.qtcsvc.settings.SettingsService;
import com.ttloc.qtcsvc.tasks.Task;
import com.ttloc.qtcsvc.tasks.TaskQueryService;
import com.ttloc.qtcsvc.tasks.TaskStep;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.ai.google.genai.GoogleGenAiChatModel;
import org.springframework.ai.google.genai.GoogleGenAiChatOptions;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Sinh nhap bao cao bang AI (spec 8.3). API key/model/provider doc RUNTIME tu
 * SettingsService (ADMIN nhap qua man hinh Settings) - KHONG dung ChatModel
 * autoconfigure tinh cua Spring AI (da tat trong application.yml), de doi key
 * khong can restart app. Viet qua interface ChatModel chung nen sau nay them
 * provider khac (openai/claude) chi can them 1 nhanh trong buildChatModel().
 */
@Service
class ReportAiService {

    private static final List<String> AI_SECTION_KEYS = List.of(
            "muc3.xay_dung", "muc3.mang_muasam", "muc3.canh_quan", "muc3.phoi_hop", "muc4");

    private final SettingsService settingsService;
    private final TaskQueryService taskQueryService;
    private final ObjectMapper objectMapper;

    ReportAiService(SettingsService settingsService, TaskQueryService taskQueryService, ObjectMapper objectMapper) {
        this.settingsService = settingsService;
        this.taskQueryService = taskQueryService;
        this.objectMapper = objectMapper;
    }

    record DraftResult(Map<String, String> sections, String provider) {
    }

    DraftResult generateDraft(ParsedPeriod period) {
        String provider = settingsService.getOrDefault(SettingKeys.AI_PROVIDER, "none");
        if (provider == null || provider.isBlank() || "none".equalsIgnoreCase(provider)) {
            throw new IllegalStateException("AI chua duoc cau hinh (vao Settings > AI, chon provider khac \"none\")");
        }

        List<Task> tasks = taskQueryService.findByPeriod(period.year(), period.quarterOrNull(), period.monthOrNull());
        String prompt = buildPrompt(tasks);
        ChatModel chatModel = buildChatModel(provider);
        String rawResponse = chatModel.call(prompt);

        return new DraftResult(parseResponse(rawResponse), provider);
    }

    private ChatModel buildChatModel(String provider) {
        if ("gemini".equalsIgnoreCase(provider)) {
            return buildGeminiChatModel();
        }
        throw new IllegalStateException("Provider AI \"" + provider + "\" chua duoc ho tro trong ban build nay "
                + "(hien chi co Google Gemini). Can them dependency Spring AI tuong ung de mo rong.");
    }

    private ChatModel buildGeminiChatModel() {
        String apiKey = settingsService.get(SettingKeys.AI_API_KEY)
                .orElseThrow(() -> new IllegalStateException("Chua nhap AI API key trong Settings"));
        String modelName = settingsService.getOrDefault(SettingKeys.AI_MODEL, "gemini-2.5-flash");

        Client client = Client.builder().apiKey(apiKey).build();
        GoogleGenAiChatOptions options = GoogleGenAiChatOptions.builder()
                .model(resolveModel(modelName))
                .build();
        return GoogleGenAiChatModel.builder()
                .genAiClient(client)
                .options(options)
                .build();
    }

    private GoogleGenAiChatModel.ChatModel resolveModel(String configured) {
        String trimmed = configured == null ? "" : configured.trim();
        for (GoogleGenAiChatModel.ChatModel m : GoogleGenAiChatModel.ChatModel.values()) {
            if (m.getValue().equalsIgnoreCase(trimmed)) {
                return m;
            }
        }
        String allowed = Arrays.stream(GoogleGenAiChatModel.ChatModel.values())
                .map(GoogleGenAiChatModel.ChatModel::getValue)
                .collect(Collectors.joining(", "));
        throw new IllegalStateException("Model AI \"" + configured + "\" khong hop le. Cac gia tri duoc ho tro: " + allowed);
    }

    private String buildPrompt(List<Task> tasks) {
        StringBuilder sb = new StringBuilder();
        sb.append("Ban la tro ly soan bao cao cong tac dinh ky cho Phong Quan tri Co so vat chat truong hoc.\n");
        sb.append("Duoi day la danh sach nhiem vu va cac buoc da/dang thuc hien trong ky bao cao:\n\n");
        if (tasks.isEmpty()) {
            sb.append("(Khong co nhiem vu nao duoc ghi nhan trong ky nay.)\n");
        }
        for (Task t : tasks) {
            sb.append("- ").append(t.title());
            if (t.description() != null && !t.description().isBlank()) {
                sb.append(": ").append(t.description());
            }
            sb.append(" (trang thai: ").append(t.status()).append(", tien do: ").append(t.progressPercent()).append("%)\n");
            for (TaskStep step : t.steps()) {
                sb.append("    + ").append(step.title()).append(" (trang thai: ").append(step.status()).append(")");
                if (step.note() != null && !step.note().isBlank()) {
                    sb.append(" - ghi chu: ").append(step.note());
                }
                sb.append("\n");
            }
        }
        sb.append("\nHay phan loai noi dung tren vao dung cac muc bao cao hanh chinh sau, viet thanh doan van mach lac ")
                .append("(khong liet ke tho), roi CHI tra ve DUY NHAT mot JSON object voi cac key sau ")
                .append("(de gia tri la chuoi rong \"\" neu khong co noi dung phu hop, KHONG duoc bo qua key nao):\n");
        sb.append("""
                {
                  "muc3.xay_dung": "... (Cong tac xay dung, bao duong, sua chua)",
                  "muc3.mang_muasam": "... (Cong tac quan tri mang, mua sam va quan ly tai san)",
                  "muc3.canh_quan": "... (Cong tac canh quan va moi truong)",
                  "muc3.phoi_hop": "... (Cong tac phoi hop, de trong neu khong co)",
                  "muc4": "... (Cong tac Doan the va Phuc vu cong dong)"
                }
                """);
        sb.append("Chi tra ve JSON thuan tuy, KHONG dung markdown code fence, KHONG giai thich them.");
        return sb.toString();
    }

    private Map<String, String> parseResponse(String rawResponse) {
        String cleaned = stripMarkdownFence(rawResponse);
        try {
            Map<String, String> parsed = objectMapper.readValue(cleaned, new TypeReference<LinkedHashMap<String, String>>() {
            });
            Map<String, String> result = new LinkedHashMap<>();
            for (String key : AI_SECTION_KEYS) {
                result.put(key, parsed.getOrDefault(key, ""));
            }
            return result;
        } catch (Exception e) {
            throw new IllegalStateException(
                    "AI tra ve noi dung khong dung dinh dang JSON, vui long thu lai. Noi dung goc: " + rawResponse, e);
        }
    }

    private String stripMarkdownFence(String text) {
        String trimmed = text.trim();
        if (trimmed.startsWith("```")) {
            int firstNewline = trimmed.indexOf('\n');
            int lastFence = trimmed.lastIndexOf("```");
            if (firstNewline > 0 && lastFence > firstNewline) {
                return trimmed.substring(firstNewline + 1, lastFence).trim();
            }
        }
        return trimmed;
    }

}
