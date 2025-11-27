package com.example.demo.controller;

import com.example.demo.entity.Board;
import com.example.demo.repository.BoardRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin(origins = "*") // 리액트에서 호출 가능하게
public class BoardController {

    private final BoardRepository boardRepository;

    // Spring 4.3+ 부터 생성자가 하나면 @Autowired 생략 가능 (최신 베스트 프랙티스)
    public BoardController(BoardRepository boardRepository) {
        this.boardRepository = boardRepository;
    }

    // ✅ 전체 게시글 조회
    @GetMapping
    public List<Board> getAllBoards() {
        return boardRepository.findAll();
    }

    // ✅ 단일 게시글 조회
    @GetMapping("/{id}")
    public Board getBoardById(@PathVariable("id") Long id) {
        return boardRepository.findById(id != null ? id : 0L).orElse(null);
    }

}
