package com.example.bullion.service;


import com.example.bullion.model.Transaction;
import com.example.bullion.model.User;

import java.util.List;

public interface Service {
    public List<User> getNames();

    public User createParty(User user);

    Transaction createTransaction(Transaction transaction);

    List<Transaction> getAllTransaction();

    List<Transaction> getAllTransactionById(String party);
}
