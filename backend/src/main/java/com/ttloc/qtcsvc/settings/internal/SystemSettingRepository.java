package com.ttloc.qtcsvc.settings.internal;

import com.ttloc.qtcsvc.settings.SystemSetting;
import org.springframework.data.repository.CrudRepository;

public interface SystemSettingRepository extends CrudRepository<SystemSetting, String> {
}
