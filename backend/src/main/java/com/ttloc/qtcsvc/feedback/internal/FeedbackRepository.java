package com.ttloc.qtcsvc.feedback.internal;

import com.ttloc.qtcsvc.feedback.FeedbackMessage;
import org.springframework.data.repository.ListCrudRepository;

import java.util.List;

interface FeedbackRepository extends ListCrudRepository<FeedbackMessage, Long> {

    List<FeedbackMessage> findAllByOrderByCreatedAtDesc();

}
