package com.phishingdetector.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.context.request.WebRequest;

import java.util.Date;
import java.util.Map;

@ControllerAdvice
public class GlobalExceptionHandler {
    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(GlobalExceptionHandler.class);

    public GlobalExceptionHandler() {
        System.out.println("DEBUG: GlobalExceptionHandler initialized and active!");
    }

    @ExceptionHandler(org.springframework.web.bind.MethodArgumentNotValidException.class)
    public ResponseEntity<?> handleValidationException(org.springframework.web.bind.MethodArgumentNotValidException ex) {
        return new ResponseEntity<>(Map.of(
                "timestamp", new Date(),
                "message", "Validation Failed",
                "errors", ex.getBindingResult().getAllErrors()
        ), HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(org.springframework.http.converter.HttpMessageNotReadableException.class)
    public ResponseEntity<?> handleJsonException(org.springframework.http.converter.HttpMessageNotReadableException ex) {
        System.out.println("DEBUG: JSON Deserialization Error: " + ex.getMessage());
        return new ResponseEntity<>(Map.of(
                "timestamp", new Date(),
                "message", "JSON Parsing Error (Deserialization Failed)",
                "details", ex.getMessage()
        ), HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<?> handleRuntimeException(RuntimeException ex, WebRequest request) {
        System.out.println("DEBUG: RuntimeException caught: " + ex.getMessage());
        ex.printStackTrace();
        return new ResponseEntity<>(Map.of(
                "timestamp", new Date(),
                "message", ex.getMessage(),
                "details", request.getDescription(false),
                "stackTrace", getFirstLines(ex, 15)
        ), HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<?> handleGlobalException(Exception ex, WebRequest request) {
        System.out.println("DEBUG: Exception caught: " + ex.getMessage());
        ex.printStackTrace();
        return new ResponseEntity<>(Map.of(
                "timestamp", new Date(),
                "message", ex.getMessage() != null ? ex.getMessage() : "No message",
                "stackTrace", getFirstLines(ex, 15),
                "details", request.getDescription(false)
        ), HttpStatus.INTERNAL_SERVER_ERROR);
    }

    @ExceptionHandler(Throwable.class)
    public ResponseEntity<?> handleThrowable(Throwable t) {
        System.out.println("DEBUG: Throwable caught: " + t.getMessage());
        t.printStackTrace();
        return new ResponseEntity<>(Map.of(
                "timestamp", new Date(),
                "message", "Critical System Error: " + t.getMessage(),
                "type", t.getClass().getName()
        ), HttpStatus.INTERNAL_SERVER_ERROR);
    }

    private String getFirstLines(Throwable ex, int lines) {
        StringBuilder stackTrace = new StringBuilder();
        for (int i = 0; i < Math.min(ex.getStackTrace().length, lines); i++) {
            stackTrace.append(ex.getStackTrace()[i].toString()).append("\n");
        }
        return stackTrace.toString();
    }
}
