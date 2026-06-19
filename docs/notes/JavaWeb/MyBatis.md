---
order: 999
title: "MyBatis"
---

# MyBatis

### 介绍

![img](/Draven_Note_Images/JavaWeb/MyBatis/MyBatis_01.png)

![img](/Draven_Note_Images/JavaWeb/MyBatis/MyBatis_介绍!_1775656684038-20_02.png)

### MyBatis入门

**细节：** `@Mapper` 注解会告诉springboot这是mybatis管理的接口，会自动生成实现类（代理对象）交给IOC容器管理。

#### 入门操作：

![img](/Draven_Note_Images/JavaWeb/MyBatis/MyBatis_入门操作：_03.png)

![img](/Draven_Note_Images/JavaWeb/MyBatis/MyBatis_入门操作：_04.png)

![img](/Draven_Note_Images/JavaWeb/MyBatis/MyBatis_入门操作：_05.png)

![img](/Draven_Note_Images/JavaWeb/MyBatis/MyBatis_入门操作：_06.png)

![img](/Draven_Note_Images/JavaWeb/MyBatis/MyBatis_入门操作：_07.png)

*为什么使用表 `user` 会报红呢？*

![img](/Draven_Note_Images/JavaWeb/MyBatis/MyBatis_入门操作：_08.png)

#### JDBC介绍：

![img](/Draven_Note_Images/JavaWeb/MyBatis/MyBatis_JDBC介绍：_09.png)

![img](/Draven_Note_Images/JavaWeb/MyBatis/MyBatis_JDBC介绍：_10.png)

![img](/Draven_Note_Images/JavaWeb/MyBatis/MyBatis_JDBC介绍：_11.png)

#### 数据库连接池：

![img](/Draven_Note_Images/JavaWeb/MyBatis/MyBatis_数据库连接池：_12.png)

![img](/Draven_Note_Images/JavaWeb/MyBatis/MyBatis_数据库连接池：_13.png)

![img](/Draven_Note_Images/JavaWeb/MyBatis/MyBatis_数据库连接池：_14.png)

#### Lombok：

![img](/Draven_Note_Images/JavaWeb/MyBatis/MyBatis_Lombok：_15.png)

### MyBatis基础增删改查

#### 案例需求：

![img](/Draven_Note_Images/JavaWeb/MyBatis/MyBatis_案例需求：_16.png)

#### 准备：

![img](/Draven_Note_Images/JavaWeb/MyBatis/MyBatis_准备：_17.png)

#### 参数占位符：

![img](/Draven_Note_Images/JavaWeb/MyBatis/MyBatis_参数占位符：_18.png)

**注意：**  `#{}`方式不可以放到 `''` 中，因为预处理的 `?` 是不能在 `''` 中的，不过可以用 `concat(字符串, 字符串, ...)` 的函数进行拼接，此时里面的字符串就可以替换成 `#{}` 。

#### 删除操作：

![img](/Draven_Note_Images/JavaWeb/MyBatis/MyBatis_删除操作：_19.png)

![img](/Draven_Note_Images/JavaWeb/MyBatis/MyBatis_删除操作：_20.png)

**细节：** `delete` 会有返回值，返回值是此次操作影响到的数据数目。

#### 插入操作：

![img](/Draven_Note_Images/JavaWeb/MyBatis/MyBatis_插入操作：_21.png)

![img](/Draven_Note_Images/JavaWeb/MyBatis/MyBatis_插入操作：_22.png)

**细节：** 主键返回【其中 `keyProperty` 代表主键在实现类中的属性， `useGeneratedKeys` 表示的是表中的主键是否返回，若为true则会返回并赋值给主键在实现类中对应的属性】。

![img](/Draven_Note_Images/JavaWeb/MyBatis/MyBatis_插入操作：_23.png)

#### 更新操作：

![img](/Draven_Note_Images/JavaWeb/MyBatis/MyBatis_更新操作：_24.png)

![img](/Draven_Note_Images/JavaWeb/MyBatis/MyBatis_更新操作：_25.png)

#### 查询操作①：

![img](/Draven_Note_Images/JavaWeb/MyBatis/MyBatis_查询操作①：_26.png)

**细节：** 查询操作中，由于表中的命名方法是通过 `___` 来分割单词的，与实现类中的驼峰命名法不一样，因此二者的变量名是不同的，mybatis就无法进行映射赋值，所以会出现无赋值的情况，解决方法如下：

![img](/Draven_Note_Images/JavaWeb/MyBatis/MyBatis_查询操作①：_27.png)

![img](/Draven_Note_Images/JavaWeb/MyBatis/MyBatis_查询操作①：_28.png)

#### 查询操作②\[条件查询]：

![img](/Draven_Note_Images/JavaWeb/MyBatis/MyBatis_查询操作②_条件查询_：_29.png)

![img](/Draven_Note_Images/JavaWeb/MyBatis/MyBatis_查询操作②_条件查询_：_30.png)

#### XML映射文件：

![img](/Draven_Note_Images/JavaWeb/MyBatis/MyBatis_XML映射文件：_31.png)

![img](/Draven_Note_Images/JavaWeb/MyBatis/MyBatis_XML映射文件：_32.png)

**注：** 使用注解来映射简单语句会使代码显得更加简洁，但对于稍微复杂一点的语句，Java 注解不仅力不从心，还会让你本就复杂的SQL语句更加混乱不堪。因此，如果需要做一些很复杂的操作，最好用XML来映射语句。并且可以在基于注解和XML的语句映射方式间自由移植和切换。

#### 日志输出：

![img](/Draven_Note_Images/JavaWeb/MyBatis/MyBatis_日志输出：_33.png)

#### 预编译SQL：

![img](/Draven_Note_Images/JavaWeb/MyBatis/MyBatis_预编译SQL：_34.png)

![img](/Draven_Note_Images/JavaWeb/MyBatis/MyBatis_预编译SQL：_35.png)

### MyBatis动态SQL

![img](/Draven_Note_Images/JavaWeb/MyBatis/MyBatis_MyBatis动态SQL_36.png)

#### `<if>`：

![img](/Draven_Note_Images/JavaWeb/MyBatis/MyBatis_`_if_`：_37.png)

![img](/Draven_Note_Images/JavaWeb/MyBatis/MyBatis_`_if_`：_38.png)

![img](/Draven_Note_Images/JavaWeb/MyBatis/MyBatis_`_if_`：_39.png)

#### `<foreach>`：

![img](/Draven_Note_Images/JavaWeb/MyBatis/MyBatis_`_foreach_`：_40.png)

#### `<sql><include>`：

![img](/Draven_Note_Images/JavaWeb/MyBatis/MyBatis_`_sql_include_`：_41.png)
