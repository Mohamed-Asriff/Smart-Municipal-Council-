package com.example.municipal;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@SpringBootApplication
@RestController
public class MunicipalApplication {
	@GetMapping({"", "/"})
	public String home() {
		return "Municipal complaint API is running.";
	}

	public static void main(String[] args) {
		SpringApplication.run(MunicipalApplication.class, args);
	}
}