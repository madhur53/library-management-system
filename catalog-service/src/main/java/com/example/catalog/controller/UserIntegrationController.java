package com.example.catalog.controller;

import com.example.catalog.dto.UserDto;
import com.example.catalog.service.UserClientService;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/catalog/integration")
public class UserIntegrationController {

	private final UserClientService userClientService;

	public UserIntegrationController(UserClientService userClientService) {
		this.userClientService = userClientService;
	}

	@GetMapping(value = "/user/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
	public UserDto getUser(@PathVariable Integer id) {
		return userClientService.getUserById(id);
	}
}
