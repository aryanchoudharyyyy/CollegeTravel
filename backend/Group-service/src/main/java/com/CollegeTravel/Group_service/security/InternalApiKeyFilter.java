package com.CollegeTravel.Group_service.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
public class InternalApiKeyFilter extends OncePerRequestFilter {
    @Value("${internal.api-key}")
    String key;
    @Override
    protected boolean shouldNotFilter(HttpServletRequest request){
        return !request.getRequestURI().startsWith("/api/internal");

    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain) throws ServletException, IOException{
        if(request.getRequestURI().startsWith("/api/internal") &&
        !key.equals(request.getHeader("X-Internal-Api-Key"))){
            response.sendError(HttpServletResponse.SC_FORBIDDEN);
            return;
        }
        var authority = new SimpleGrantedAuthority("ROLE_INTERNAL_SERVICE");
        var auth = new UsernamePasswordAuthenticationToken(
                "internal-service", null, List.of(authority)
        );
        SecurityContextHolder.getContext().setAuthentication(auth);
        chain.doFilter(request,response);
    }
}
