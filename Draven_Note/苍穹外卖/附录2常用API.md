# 附录2 常用API

#### `DigestUtils`：

```
是 Java 开发中高频使用的工具类，用于**数据摘要加密**。生成不可逆的哈希摘要，用于数据校验、密码加密、文件完整性验证。
```

**特性**：所有方法均为**静态方法**，摘要算法**不可逆**，仅能用于验证数据一致性，无法解密；生成的摘要长度固定（如 MD5 固定32位）。

**异常处理：**会抛出`RuntimeException`（如`IllegalArgumentException`），调用时需捕获或向上抛出，避免程序崩溃。

**方法：**

| 方法名 | 方法功能 | 参数说明 | 返回值 | 备注 |
| --- | --- | --- | --- | --- |
| `md5Hex(byte[] data)` | 计算字节数组的 MD5 摘要，返回十六进制字符串 | `data`：待摘要的字节数组 | 32位十六进制字符串 | 最常用的 MD5 摘要方法 |
| `md5Hex(String data)` | 计算字符串的 MD5 摘要（默认 UTF-8 编码） | `data`：待摘要的字符串 | 32位十六进制字符串 | 简化字符串摘要操作，无需手动转字节数组 |
| `sha1Hex(byte[] data)` | 计算字节数组的 SHA-1 摘要，返回十六进制字符串 | `data`：待摘要的字节数组 | 40位十六进制字符串 | 安全性略高于 MD5，仍逐渐被 SHA-256 替代 |
| `sha256Hex(byte[] data)` | 计算字节数组的 SHA-256 摘要，返回十六进制字符串 | `data`：待摘要的字节数组 | 64位十六进制字符串 | 目前主流的安全摘要算法，推荐用于密码/数据校验 |
| `md5(byte[] data)` | 计算字节数组的 MD5 摘要，返回字节数组 | `data`：待摘要的字节数组 | 16字节字节数组 | 底层实现，需手动转十六进制才易读 |

***

#### `BeanUtils`：

是 Java 开发中高频使用的工具类，用于**JavaBean属性操作**。简化 JavaBean 的反射操作，实现属性获取、设置、拷贝、实例化等。

**版本差异**：

* Spring 版性能更优，避免了 Apache 版的部分反射性能损耗，**开发中优先选择 Spring 版**。
* 浅拷贝风险：**`copyProperties`** 对引用类型属性（如**`List`**、自定义对象）仅复制引用，修改目标对象会影响源对象，需手动深拷贝。

**异常处理：**会抛出**`RuntimeException`**（如**`IllegalArgumentException`**），调用时需捕获或向上抛出，避免程序崩溃。

**方法：**

| 方法名 | 方法功能 | 参数说明 | 返回值 | 备注 |
| --- | --- | --- | --- | --- |
| `getProperty(Object bean, String name)` | 获取 JavaBean 的指定属性值 | `bean`：目标对象；`name`：属性名（支持嵌套属性，如`user.name`） | 属性值对象 | 底层通过反射获取，无需手动写getter调用 |
| `setProperty(Object bean, String name, Object value)` | 设置 JavaBean 的指定属性值 | `bean`：目标对象；`name`：属性名；`value`：待设置的属性值 | void | 底层通过反射调用setter，简化属性赋值 |
| `copyProperties(Object source, Object target)` | 将源 JavaBean 的属性拷贝到目标对象 | `source`：源对象；`target`：目标对象 | void | 浅拷贝：仅拷贝属性值，引用类型仅复制引用；属性名/类型需兼容 |
| `instantiateClass(Class<?> clazz)` | 实例化指定类（无参构造函数） | `clazz`：待实例化的类 | 类的实例 | 简化反射创建对象，替代`clazz.newInstance()`（已废弃） |
| `findPropertyType(Class<?> beanClass, String propertyName)` | 查找 JavaBean 中指定属性的类型 | `beanClass`：Bean的类；`propertyName`：属性名 | Class\<?> | 无需通过实例即可获取属性类型，适用于动态解析场景 |

***

#### `ThreadLocal＜T＞ `：

**`<font style="background-color:rgba(0, 0, 0, 0);">ThreadLocal<T></font>`** 是 **JDK 原生**的线程本地变量工具类（位于 `java.lang` 包），是多线程开发的核心工具。**核心作用**：为**每个线程创建独立的变量副本**，实现**线程间数据完全隔离**。它不用于线程共享数据，而是解决多线程下非共享变量的并发安全问题，**无锁设计、性能极高**。

**特性：**线程隔离，每个线程只能操作自己的变量副本，互不干扰；天生线程安全，不需要 `synchronized` 等锁机制。

**方法：**

| **方法名** | **方法功能** | **核心说明** |
| :--- | :--- | :--- |
| `void set(T value)` | 为当前线程设置变量副本 | 存储当前线程专属的数据，其他线程无法访问 |
| `T get()` | 获取当前线程的变量副本 | 读取当前线程专属数据，未设置时返回 `null` |
| `void remove()` | **删除当前线程的变量副本** | 必须手动调用！用于清理数据，**避免内存泄漏** |
| `<font style="background-color:rgba(0, 0, 0, 0);">static <S> ThreadLocal<S> withInitial(Supplier<S> supplier)</font>` | JDK8+ 初始化默认值 | 简化初始值设置，无需重写 `initialValue()`<br/> 方法 |

***

#### ObjectMapper（JSON 转换工具）

最常用的手动序列化、反序列化、配置方法，Jackson 框架的**核心工具类**，实现 **Java 对象 ↔ JSON** 的序列化 / 反序列化。

| **方法** | **功能说明** | **典型用法** |
| :--- | :--- | :--- |
| `writeValueAsString(Object obj)` | Java 对象 → JSON 字符串 | 手动把对象转 JSON |
| `<font style="background-color:rgba(0, 0, 0, 0);">readValue(String json, Class<T>)</font>` | JSON 字符串 → Java 对象 | 手动解析 JSON 为对象 |
| `writeValueAsBytes(Object obj)` | Java 对象 → JSON 字节数组 | 网络传输、文件存储 |
| `<font style="background-color:rgba(0, 0, 0, 0);">readValue(byte[] bytes, Class<T>)</font>` | JSON 字节数组 → Java 对象 | 解析二进制 JSON 数据 |
| `configure(Feature, boolean)` | 全局配置转换规则 | 忽略未知字段、格式化日期、空值不序列化 |
| `setDateFormat(DateFormat)` | 统一日期序列化格式 | 解决后端日期返回时间戳问题 |

#### HttpMessageConverter（Spring HTTP 消息转换接口）

Spring 提供的**消息转换接口**，处理 HTTP 请求 / 响应体的格式转换，Spring 提供了默认实现 **`MappingJackson2HttpMessageConverter`**（基于 Jackson），是前后端交互的核心。

| **核心方法 / 功能** | **作用** | **对应注解** |
| :--- | :--- | :--- |
| `read(...)` | 读取 HTTP 请求体，将 JSON 转为 Java 对象 | `@RequestBody` |
| `write(...)` | 将 Java 对象转为 JSON，写入 HTTP 响应体 | `@ResponseBody`<br/> / `@RestController` |
| `canRead/canWrite` | 判断是否支持当前请求 / 响应的格式（如 JSON） | Spring 自动匹配转换器 |
| `setObjectMapper(...)` | 注入**自定义 ObjectMapper**，统一全局 JSON 规则 | 全局配置 JSON 格式 |

**依赖关系：**Spring 默认的 JSON 转换器 `MappingJackson2HttpMessageConverter**`内部持有 `ObjectMapper**`，所有 HTTP 的 JSON 转换，**底层都是 `ObjectMapper` 完成的**。

**工作流程（前后端交互）：**

* 前端传 JSON → Spring 用 **`HttpMessageConverter`** 接收 → 调用 **`ObjectMapper.readValue()`** 转为 Java 对象
* 后端返回 Java 对象 → Spring 用 **`HttpMessageConverter`** 处理 → 调用 **`ObjectMapper.writeValueAsString()`** 转为 JSON

**使用场景：**

* 手动转换 JSON：直接用 **`ObjectMapper`**
* 接口自动转换：Spring 自动用 **`HttpMessageConverter`**（无需手动调用）

***

#### `HttpClient`：

![[../Draven_Note_Images/苍穹外卖/附录2常用API/附录2 常用API_`HttpClient`：_01.png]]

**举例：**

```java
public void testGET() throws Exception{
    // 创建httpcLient对象
    CloseableHttpClient httpClient = HttpClients.createDefault();
    
    // 创建请求对象
    HttpGet httpGet = new HttpGet("http://localhost:8080/user/shop/status");
    
    // 发送请求，接受响应结果
    CloseableHttpResponse response = httpClient.execute(httpGet);
    
    // 获取服务端返回的状态码
    int statusCode = response.getStatusLine().getStatusCode();
    System.out.println("服务端返回的状态码为：" + statusCode);
    
    HttpEntity entity = response.getEntity();
    String body = EntityUtils.toString(entity);
    System.out.println("服务端返回的数据为：" + body);
    
    // 关闭资源
    response.close();
    httpClient.close();
}
```

```java
public void testPOST() throws Exception{
    // 创建httpclient对象
    CloseableHttpClient httpClient = HttpClients.createDefault();
    //创建请求对象
    HttpPost httpPost = new HttpPost("http://localhost:8080/admin/employee/login");
    
    JSONObject jsonObject = new JSONObject();
    jsonObject.put("username","admin");
    jsonObject.put("password","123456");
    StringEntity entity = new StringEntity(jsonObject.toString());
    
    //指定请求编码方式
        entity.setContentEncoding("utf-8");
        // 数据格式
        entity.setContentType("application/json");httpPost.setEntity(entity);
        
        // 发送请求
        httpPost.setEntity(entity);
    CloseableHttpResponse response = httpClient.execute(httpPost);
    
    // 解析返回结果
    int statusCode = response.getStatusLine().getStatusCode();
    System.out.println("响应码为："+statusCode);
    HttpEntity entity1 = response.getEntity();
    String body = EntityUtils.toString(entity1);
    System.out.println("响应数据为："+body);
    
    // 关闭资源
    response.close();
    httpClient.close();
}
```

***
