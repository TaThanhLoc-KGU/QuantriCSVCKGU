package com.ttloc.qtcsvc;

import org.junit.jupiter.api.Test;
import org.springframework.modulith.core.ApplicationModules;

class ModulithStructureTests {

	ApplicationModules modules = ApplicationModules.of(QtcsvcApplication.class);

	@Test
	void verifiesModularStructure() {
		modules.verify();
	}

}
