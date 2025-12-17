package com.example.catalog.service;

import com.example.catalog.dto.UserDto;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

@Service
public class UserClientService {

	private final WebClient userServiceWebClient;

	public UserClientService(WebClient userServiceWebClient) {
		this.userServiceWebClient = userServiceWebClient;
	}

	public UserDto getUserById(Integer userId) {
		return userServiceWebClient.get()
				.uri("/api/users/{id}", userId)
				.retrieve()
				.bodyToMono(UserDto.class)
				.block(); // sync for simplicity
	}
}
