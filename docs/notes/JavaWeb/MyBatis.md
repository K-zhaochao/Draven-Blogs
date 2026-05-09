---
order: 999
title: "MyBatis"
---

# MyBatis

### 介绍<img src="/Draven_Note_Images/JavaWeb/MyBatis/MyBatis_01.png" alt="img" />

<img src="/Draven_Note_Images/JavaWeb/MyBatis/MyBatis_介绍!_1775656684038-20_02.png" alt="img" />

***

### MyBatis入门

***细节：***`@Mapper`*注解会告诉springboot这是mybatis管理的接口，会自动生成实现类（代理对象）交给IOC容器管理。*

#### 入门操作：

<img src="/Draven_Note_Images/JavaWeb/MyBatis/MyBatis_入门操作：_03.png" alt="img" />

<img src="/Draven_Note_Images/JavaWeb/MyBatis/MyBatis_入门操作：_04.png" alt="img" />

<img src="/Draven_Note_Images/JavaWeb/MyBatis/MyBatis_入门操作：_05.png" alt="img" />

<img src="/Draven_Note_Images/JavaWeb/MyBatis/MyBatis_入门操作：_06.png" alt="img" />

<img src="/Draven_Note_Images/JavaWeb/MyBatis/MyBatis_入门操作：_07.png" alt="img" />

*为什么使用表*`user`*会报红呢？*

<img src="/Draven_Note_Images/JavaWeb/MyBatis/MyBatis_入门操作：_08.png" alt="img" />

#### JDBC介绍：

<img src="/Draven_Note_Images/JavaWeb/MyBatis/MyBatis_JDBC介绍：_09.png" alt="img" />

<img src="/Draven_Note_Images/JavaWeb/MyBatis/MyBatis_JDBC介绍：_10.png" alt="img" />

<img src="/Draven_Note_Images/JavaWeb/MyBatis/MyBatis_JDBC介绍：_11.png" alt="img" />

#### 数据库连接池：

<img src="/Draven_Note_Images/JavaWeb/MyBatis/MyBatis_数据库连接池：_12.png" alt="img" />

<img src="/Draven_Note_Images/JavaWeb/MyBatis/MyBatis_数据库连接池：_13.png" alt="img" />

<img src="/Draven_Note_Images/JavaWeb/MyBatis/MyBatis_数据库连接池：_14.png" alt="img" />

#### Lombok：

<img src="/Draven_Note_Images/JavaWeb/MyBatis/MyBatis_Lombok：_15.png" alt="img" />

***

### MyBatis基础增删改查

#### 案例需求：

<img src="/Draven_Note_Images/JavaWeb/MyBatis/MyBatis_案例需求：_16.png" alt="img" />

#### 准备：

<img src="/Draven_Note_Images/JavaWeb/MyBatis/MyBatis_准备：_17.png" alt="img" />

#### 参数占位符：

<img src="/Draven_Note_Images/JavaWeb/MyBatis/MyBatis_参数占位符：_18.png" alt="img" />

***注意：***`#{}`*方式不可以放到*`''`*中，因为预处理的*`?`*是不能在*`''`*中的，不过可以用*`concat(字符串, 字符串, ...)`*的函数进行拼接，此时里面的字符串就可以替换成*`#{}`*。*

#### 删除操作：

<img src="/Draven_Note_Images/JavaWeb/MyBatis/MyBatis_删除操作：_19.png" alt="img" />

<img src="/Draven_Note_Images/JavaWeb/MyBatis/MyBatis_删除操作：_20.png" alt="img" />

***细节：***`delete`*会有返回值，返回值是此次操作影响到的数据数目。*

#### 插入操作：

<img src="/Draven_Note_Images/JavaWeb/MyBatis/MyBatis_插入操作：_21.png" alt="img" />

<img src="/Draven_Note_Images/JavaWeb/MyBatis/MyBatis_插入操作：_22.png" alt="img" />

***细节：**\_\_主键返回【其中*`keyProperty`*代表主键在实现类中的属性，*`useGeneratedKeys`*表示的是表中的主键是否返回，若为true则会返回并赋值给主键在实现类中对应的属性】。*

<img src="/Draven_Note_Images/JavaWeb/MyBatis/MyBatis_插入操作：_23.png" alt="img" />

#### 更新操作：

<img src="/Draven_Note_Images/JavaWeb/MyBatis/MyBatis_更新操作：_24.png" alt="img" />

<img src="/Draven_Note_Images/JavaWeb/MyBatis/MyBatis_更新操作：_25.png" alt="img" />

#### 查询操作①：

<img src="/Draven_Note_Images/JavaWeb/MyBatis/MyBatis_查询操作①：_26.png" alt="img" />

***细节：**\_\_查询操作中，由于表中的命名方法是通过*`___`*来分割单词的，与实现类中的驼峰命名法不一样，因此二者的变量名是不同的，mybatis就无法进行映射赋值，所以会出现无赋值的情况，解决方法如下：*

<img src="/Draven_Note_Images/JavaWeb/MyBatis/MyBatis_查询操作①：_27.png" alt="img" />

<img src="/Draven_Note_Images/JavaWeb/MyBatis/MyBatis_查询操作①：_28.png" alt="img" />

#### 查询操作②\[条件查询]：

<img src="/Draven_Note_Images/JavaWeb/MyBatis/MyBatis_查询操作②_条件查询_：_29.png" alt="img" />

<img src="/Draven_Note_Images/JavaWeb/MyBatis/MyBatis_查询操作②_条件查询_：_30.png" alt="img" />

#### XML映射文件：

<img src="/Draven_Note_Images/JavaWeb/MyBatis/MyBatis_XML映射文件：_31.png" alt="img" />

<img src="/Draven_Note_Images/JavaWeb/MyBatis/MyBatis_XML映射文件：_32.png" alt="img" />

***注：**\_\_使用注解来映射简单语句会使代码显得更加简洁，但对于稍微复杂一点的语句，Java 注解不仅力不从心，还会让你本就复杂的SQL语句更加混乱不堪。因此，如果需要做一些很复杂的操作，最好用XML来映射语句。并且可以在基于注解和XML的语句映射方式间自由移植和切换。*

#### 日志输出：

<img src="/Draven_Note_Images/JavaWeb/MyBatis/MyBatis_日志输出：_33.png" alt="img" />

#### 预编译SQL：

<img src="/Draven_Note_Images/JavaWeb/MyBatis/MyBatis_预编译SQL：_34.png" alt="img" />

<img src="/Draven_Note_Images/JavaWeb/MyBatis/MyBatis_预编译SQL：_35.png" alt="img" />

***

### MyBatis动态SQL

<img src="/Draven_Note_Images/JavaWeb/MyBatis/MyBatis_MyBatis动态SQL_36.png" alt="img" />

#### `<if>`：

<img src="/Draven_Note_Images/JavaWeb/MyBatis/MyBatis_`_if_`：_37.png" alt="img" />

<img src="/Draven_Note_Images/JavaWeb/MyBatis/MyBatis_`_if_`：_38.png" alt="img" />

<img src="/Draven_Note_Images/JavaWeb/MyBatis/MyBatis_`_if_`：_39.png" alt="img" />

#### `<foreach>`：

<img src="/Draven_Note_Images/JavaWeb/MyBatis/MyBatis_`_foreach_`：_40.png" alt="img" />

#### `<sql><include>`：

<img src="/Draven_Note_Images/JavaWeb/MyBatis/MyBatis_`_sql_include_`：_41.png" alt="img" />
