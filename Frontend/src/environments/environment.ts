export const environment = {
  /**
   * Single place to configure the backend base URL.
   * In development "/api" is proxied to http://localhost:8282 by proxy.conf.json
   * (the Spring Boot app has no CORS configuration, so the proxy avoids touching it).
   * For a deployed build, point this at your reverse-proxied backend path.
   */
  apiBaseUrl: '/api',

  /**
   * The backend currently has NO "list all classes" endpoint.
   * If you later add one (e.g. GET /getAllClasses returning SchoolClass[]), put its path here
   * and the frontend will use it instead of the lookup workaround. Leave '' until then.
   */
  classListEndpoint: '',
};
