# nodejs-14.15.5 ConcurrentMarking segfault

In order to reproduce the issue, please start the server using the following command.
```
node ./new_server_test.js
```

After the server was started, the client can be started using the following command:
```
node ./new_client_test.js
```

After that, the server starts sending `JSON` data to the client, which eventually may fail with a `SIGSEGV` after some time.

In our tests, most of the time, the client failed within the first 10 seconds. However, it also happend that it took a bit longer. From time to time, also the the server crashed before the client with a `SIGSEGV`.

In some rare cases also both the client and the server crashed with a `SIGSEGV`. We assume that the unexpected client crash caused the server crash in such cases.