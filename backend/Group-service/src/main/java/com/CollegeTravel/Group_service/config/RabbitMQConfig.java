package com.CollegeTravel.Group_service.config;

import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.DirectExchange;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.QueueBuilder;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {
    public static final String EXCHANGE_NAME="trip.exchange";
    public static final String QUEUE_NAME ="trip-created-queue";
    public static final String ROUTING_KEY="trip.created";
    public static final String DEAD_LETTER_EXCHANGE_NAME="trip.dead-letter.exchange";
    public static final String DEAD_LETTER_QUEUE_NAME="trip-created-dead-letter-queue";
    public static final String DEAD_LETTER_ROUTING_KEY="trip.created.dead-letter";
    @Bean
    public DirectExchange tripExchange(){
        return new DirectExchange(EXCHANGE_NAME);
    }
    @Bean
    public Queue tripCreatedQueue(){
        return QueueBuilder.durable(QUEUE_NAME)
                .deadLetterExchange(DEAD_LETTER_EXCHANGE_NAME)
                .deadLetterRoutingKey(DEAD_LETTER_ROUTING_KEY)
                .build();
    }
    @Bean
    public Binding binding(Queue tripCreatedQueue, DirectExchange tripExchange){
        return BindingBuilder.bind(tripCreatedQueue).to(tripExchange).with(ROUTING_KEY);
    }
    @Bean
    public DirectExchange tripDeadLetterExchange(){
        return new DirectExchange(DEAD_LETTER_EXCHANGE_NAME);
    }
    @Bean
    public Queue tripCreatedDeadLetterQueue(){
        return QueueBuilder.durable(DEAD_LETTER_QUEUE_NAME).build();
    }
    @Bean
    public Binding tripCreatedDeadLetterBinding(Queue tripCreatedDeadLetterQueue,
                                                DirectExchange tripDeadLetterExchange){
        return BindingBuilder.bind(tripCreatedDeadLetterQueue)
                .to(tripDeadLetterExchange)
                .with(DEAD_LETTER_ROUTING_KEY);
    }
    @Bean
    public Jackson2JsonMessageConverter jsonMessageConverter(){
        return new Jackson2JsonMessageConverter();
    }

}
