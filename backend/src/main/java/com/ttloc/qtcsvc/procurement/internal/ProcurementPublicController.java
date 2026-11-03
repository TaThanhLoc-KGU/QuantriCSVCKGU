package com.ttloc.qtcsvc.procurement.internal;

import com.ttloc.qtcsvc.procurement.internal.ProcurementDtos.FormView;
import com.ttloc.qtcsvc.procurement.internal.ProcurementDtos.PublicRoundDetail;
import com.ttloc.qtcsvc.procurement.internal.ProcurementDtos.PublicRoundList;
import com.ttloc.qtcsvc.procurement.internal.ProcurementDtos.SaveRequest;
import com.ttloc.qtcsvc.procurement.internal.ProcurementDtos.SaveResult;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/public/procurement")
class ProcurementPublicController {

    private final ProcurementService service;

    ProcurementPublicController(ProcurementService service) {
        this.service = service;
    }

    @GetMapping("/rounds")
    PublicRoundList rounds() {
        return new PublicRoundList(service.openRounds());
    }

    @GetMapping("/rounds/{roundId}")
    PublicRoundDetail round(@PathVariable Long roundId) {
        return service.publicRound(roundId);
    }

    @GetMapping("/rounds/{roundId}/units/{unitId}")
    FormView form(@PathVariable Long roundId, @PathVariable Long unitId) {
        return service.form(roundId, unitId);
    }

    @PutMapping("/rounds/{roundId}/units/{unitId}")
    SaveResult save(@PathVariable Long roundId, @PathVariable Long unitId, @RequestBody SaveRequest req) {
        return service.save(roundId, unitId, req);
    }

}
