package com.smc.dto;

public class AuthResponse {
    private Object user;
    private String token;

    public AuthResponse() {}

    public AuthResponse(Object user, String token) {
        this.user = user;
        this.token = token;
    }

    public Object getUser() {
        return user;
    }

    public void setUser(Object user) {
        this.user = user;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }
}
