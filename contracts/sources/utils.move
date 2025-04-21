module Charui::utils;

public enum Option<T> has store {
    None,
    Some(T),
}
