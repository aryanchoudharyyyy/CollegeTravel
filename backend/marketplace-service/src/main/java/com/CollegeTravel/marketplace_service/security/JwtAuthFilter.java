package com.CollegeTravel.marketplace_service.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import javax.crypto.SecretKey;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.rmi.ServerException;
import java.rmi.server.ServerCloneException;
import java.util.List;

@Component
public class JwtAuthFilter extends OncePerRequestFilter {
    private  static final Logger log = LoggerFactory.getLogger(JwtAuthFilter.class);
    @Value("${jwt.secret}")
    private String secret;
    @Override
    protected  void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)throws ServletException, IOException{
        String authHeader = request.getHeader("Authorization");
        if(authHeader!=null && authHeader.startsWith("Bearer ")){
            String token = authHeader.substring(7);
            try{
                SecretKey key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
                Claims claims = Jwts.parser().verifyWith(key).build().parseSignedClaims(token).getPayload();
                String email = claims.getSubject();
                Number userIdRaw = claims.get("userId", Number.class);
                Long userId = userIdRaw!= null? userIdRaw.longValue():null;
                request.setAttribute("userId", userId);
                SecurityContextHolder.getContext().setAuthentication(
                        new UsernamePasswordAuthenticationToken(
                                email, null, List.of()
                        )
                );
            }
            catch (Exception e){
                log.warn("JWT validation failed for request {}: {}", request.getRequestURI(), e.getMessage());
                log.debug("JWT validation failure details:", e);
            }
        }
        filterChain.doFilter(request,response);
    }
}
