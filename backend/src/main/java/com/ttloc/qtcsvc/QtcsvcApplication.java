package com.ttloc.qtcsvc;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.modulith.Modulithic;

@Modulithic(systemName = "QTCSVC")
@SpringBootApplication
public class QtcsvcApplication {

	public static void main(String[] args) {
		SpringApplication.run(QtcsvcApplication.class, args);
	}

}
