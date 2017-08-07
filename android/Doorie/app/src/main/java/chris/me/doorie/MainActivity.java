package chris.me.doorie;

import android.content.Context;
import android.content.DialogInterface;
import android.content.Intent;
import android.os.AsyncTask;
import android.support.v7.app.AlertDialog;
import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;
import android.text.Editable;
import android.text.TextWatcher;
import android.text.method.ScrollingMovementMethod;
import android.util.Log;
import android.view.Menu;
import android.view.MenuInflater;
import android.view.MenuItem;
import android.view.View;
import android.view.inputmethod.InputMethodManager;
import android.widget.Button;
import android.widget.EditText;
import android.widget.TextView;
import android.widget.Toast;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;
import java.net.InetAddress;
import java.net.MalformedURLException;
import java.net.ProtocolException;
import java.net.SocketTimeoutException;
import java.net.URL;

import javax.net.ssl.HttpsURLConnection;

import static chris.me.doorie.Secret.*;

public class MainActivity extends AppCompatActivity {

    Button l;
    Button r;
    Button showlog;
    EditText editPin;
    String currentPin = "";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        Context c = this;




        //
        // TODO fix button visibility
        //

        l = (Button) findViewById(R.id.l);
        r = (Button) findViewById(R.id.r);
        showlog = (Button) findViewById(R.id.showlog);
        editPin = (EditText) findViewById(R.id.editPin);

        l.setOnClickListener((event) -> {
            Toast.makeText(this, "Linkes Tor öffnen / schließen...", Toast.LENGTH_SHORT).show();
            MyTask m = new MyTask(new Callback() {
                @Override
                public void onResult(String result) {
                    setButtonsState(true);
                }

                @Override
                public void onError(Exception e) {
                    setButtonsState(true);
                    Toast.makeText(c, e.getMessage(), Toast.LENGTH_SHORT).show();
                }
            });
            m.execute("r", currentPin, "");
        });

        r.setOnClickListener((event) -> {
            Toast.makeText(this, "Rechtes Tor öffnen / schließen...", Toast.LENGTH_SHORT).show();
            MyTask m = new MyTask(new Callback() {
                @Override
                public void onResult(String result) {
                    setButtonsState(true);
                }

                @Override
                public void onError(Exception e) {
                    setButtonsState(true);
                    Toast.makeText(c, e.getMessage(), Toast.LENGTH_SHORT).show();
                }
            });
            m.execute("l", currentPin, "");
        });

        showlog.setOnClickListener((event) -> {
            MyTask m = new MyTask(new Callback() {
                @Override
                public void onResult(String responseLog) {
                    setButtonsState(true);
                    showDialogLog(responseLog);
                }

                @Override
                public void onError(Exception e) {
                    setButtonsState(true);
                    Toast.makeText(c, e.getMessage(), Toast.LENGTH_SHORT).show();
                }
            });
            m.execute("l", currentPin, "fetchLog");
        });


        editPin.addTextChangedListener(new TextWatcher() {
            @Override
            public void beforeTextChanged(CharSequence s, int start, int count, int after) {

            }

            @Override
            public void onTextChanged(CharSequence s, int start, int before, int count) {
                currentPin = s.toString().trim();
                if(currentPin.length() == 5) {
                    editPin.clearFocus();
                    // Check if no view has focus:
                    View view = editPin;
                    if (view != null) {
                        InputMethodManager imm = (InputMethodManager)getSystemService(Context.INPUT_METHOD_SERVICE);
                        imm.hideSoftInputFromWindow(view.getWindowToken(), 0);
                    }
                }
            }

            @Override
            public void afterTextChanged(Editable s) {

            }
        });
    }

    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        MenuInflater inflater = getMenuInflater();
        inflater.inflate(R.menu.context_menu, menu);
        return true;
    }

    @Override
    public boolean onOptionsItemSelected(MenuItem item) {
        int id = item.getItemId();
        if (id == R.id.menu_settings) {
            Intent i = new Intent(this, SettingsActivity.class);
            startActivity(i);
            return true;
        }
        return super.onOptionsItemSelected(item);

    }

    public void showDialogLog(String str) {
        AlertDialog.Builder builder = new AlertDialog.Builder(this);
        builder.setTitle("Access Log:");


        TextView t = new TextView(this);

        t.setMovementMethod(new ScrollingMovementMethod());
        t.setText(str);
        builder.setView(t);

        builder.setPositiveButton("OK", new DialogInterface.OnClickListener() {
            @Override
            public void onClick(DialogInterface dialog, int which) {
                dialog.cancel();
            }
        });

        builder.show();
    }

    /**
     * set all UI buttons enabled (or disabled)
     * @param active true -> enabled, false -> disabled
     */
    public void setButtonsState(boolean active) {
        l.setEnabled(active);
        r.setEnabled(active);
        showlog.setEnabled(active);
    }
}


/**
 * TODO: rewrite this stuff (code duplicates etc.)
 */
class MyTask extends AsyncTask<String, Void, Void> {

    Callback handler;
    String result;

    boolean isError = false;
    Exception exception;

    public MyTask(Callback callback) {
        this.handler = callback;
    }

    @Override
    protected Void doInBackground(String... params) {

        // first check for Internet Connection
        if(!isInternetAvailable()) {
            setError(new Exception("No Internet available..."));
            return null;
        }

        String whichDoor = params[0];
        String currentPin = params[1];
        String operation = params[2];

        if(operation.equalsIgnoreCase("fetchLog")) {
            try {
                URL url = new URL(LOGURL);
                HttpsURLConnection con = (HttpsURLConnection) url.openConnection();
                con.setConnectTimeout(CONNECTION_TIMEOUT);
                con.setRequestProperty("Content-Type",
                        "application/x-www-form-urlencoded");
                con.setRequestMethod("POST");
                OutputStreamWriter post = new OutputStreamWriter(con.getOutputStream());
                post.write("key=" + Secret.PASSWORD + currentPin);
                post.flush();
                post.close();
                // get respone
                InputStream is = con.getInputStream();
                BufferedReader br = new BufferedReader(new InputStreamReader(is));
                String line;
                StringBuffer response = new StringBuffer();
                while ((line = br.readLine()) != null) {
                    response.append(line);
                    response.append('\r');
                    response.append('\n');
                }
                br.close();
                Log.i("Doorie", "Request answer: \n" + response.toString());
                result = response.toString();
                publishProgress();
                return null;
            } catch (SocketTimeoutException stoe) {
                setError(stoe);
            } catch(Exception e) {
                setError(e);
                e.printStackTrace();
            }
            return null;
        }

        URL url = null;
        try {
            url = new URL(HOST);
        } catch (MalformedURLException e) {
            setError(e);
            e.printStackTrace();
            return null;
        }

        HttpsURLConnection con = null;
        try {
            con = (HttpsURLConnection) url.openConnection();
            con.setConnectTimeout(CONNECTION_TIMEOUT);
            con.setRequestProperty("Content-Type",
                    "application/x-www-form-urlencoded");
        } catch (SocketTimeoutException stoe) {
            setError(stoe);
            stoe.printStackTrace();
            return null;
        } catch (IOException e) {
            setError(e);
            e.printStackTrace();
            return null;
        }

        try {
            con.setRequestMethod("POST");
        } catch (ProtocolException e) {
            setError(e);
            e.printStackTrace();
            return null;
        }

        try {
            OutputStreamWriter post = new OutputStreamWriter(con.getOutputStream());
            post.write("key=" + PASSWORD + currentPin + "&door=" + whichDoor + "&todo=open");
            post.flush();
            post.close();
        } catch (IOException e) {
            setError(e);
            e.printStackTrace();
            return null;
        }

        try {
            // get response
            InputStream is = con.getInputStream();
            BufferedReader br = new BufferedReader(new InputStreamReader(is));
            String line;
            StringBuffer response = new StringBuffer();
            while((line = br.readLine()) != null) {
                response.append(line);
                response.append('\r');
            }
            br.close();
            Log.i("Doorie", "Request answer: \n" + response.toString());
        } catch( Exception e ) {
            setError(e);
            e.printStackTrace();
            return null;
        }

        return null;
    }

    @Override
    protected void onProgressUpdate(Void... values) {
        super.onProgressUpdate(values);
        if(!isError) {
            handler.onResult(result);
        } else {
            handler.onError(exception);
        }
    }

    public boolean isInternetAvailable() {
        try {
            InetAddress ipAddr = InetAddress.getByName("google.com");
            return !ipAddr.equals("");
        } catch (Exception e) {
            return false;
        }
    }

    public void setError(Exception e) {
        exception = e;
        isError = true;
        publishProgress();
    }
}