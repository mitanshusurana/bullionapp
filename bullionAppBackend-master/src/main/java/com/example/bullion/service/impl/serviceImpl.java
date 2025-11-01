package com.example.bullion.service.impl;

import com.example.bullion.model.Transaction;
import com.example.bullion.model.User;
import com.example.bullion.repo.TransRepo;
import com.example.bullion.repo.UserRepo;
import com.example.bullion.service.Service;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.Collections;
import java.util.List;

@org.springframework.stereotype.Service
public class serviceImpl implements Service {

    @Autowired
    UserRepo userRepo;

    @Autowired
    TransRepo transRepo;
    @Override
    public List<User> getNames() {
        return userRepo.findAll();
    }

    @Override
    public User createParty(User user)
    {

        return userRepo.insert(user);
}

    @Override
    public Transaction createTransaction(Transaction transaction) {
        return transRepo.insert(transaction);
    }

    @Override
    public List<Transaction> getAllTransaction() {
        return transRepo.findAll();
    }

    @Override
    public List<Transaction> getAllTransactionById(String party) {
        return transRepo.findAllByName(party);
    }
}
