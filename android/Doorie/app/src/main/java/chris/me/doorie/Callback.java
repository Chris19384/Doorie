package chris.me.doorie;

public interface Callback {
    void onResult(String result);
    void onError(Exception e);
    void log(String s);
}
