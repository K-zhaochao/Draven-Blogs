---
order: 22
title: "22.IO流"
---

# 22. IO流

<img src="/Draven_Note_Images/Java/22.IO流/index/22. IO流_01.png" alt="img" />

### IO流的分类
<img src="/Draven_Note_Images/Java/22.IO流/index/22. IO流_IO流的分类_02.png" alt="img" />

_**注意：**__纯文本文件指的是Windows自带的记事本能打开并且能看懂的文件（比如.txt/.md文件）。_

<img src="/Draven_Note_Images/Java/22.IO流/index/22. IO流_IO流的分类_03.png" alt="img" />

---

### IO流体系
<img src="/Draven_Note_Images/Java/22.IO流/index/22. IO流_IO流体系_04.png" alt="img" />

_**注意：**__上面均是抽象类。_

#### 字节流：
<img src="/Draven_Note_Images/Java/22.IO流/index/22. IO流_字节流：_05.png" alt="img" />

##### FileOutputStream类：
<img src="/Draven_Note_Images/Java/22.IO流/index/22. IO流_FileOutputStream类：_06.png" alt="img" />

<img src="/Draven_Note_Images/Java/22.IO流/index/22. IO流_FileOutputStream类：_07.png" alt="img" />

**输出数据的方式：**

<img src="/Draven_Note_Images/Java/22.IO流/index/22. IO流_FileOutputStream类：_08.png" alt="img" />

---

##### FileInputStream类：
<img src="/Draven_Note_Images/Java/22.IO流/index/22. IO流_FileInputStream类：_09.png" alt="img" />

<img src="/Draven_Note_Images/Java/22.IO流/index/22. IO流_FileInputStream类：_10.png" alt="img" />

_**注意：**__先开的文件最后关闭。_

<img src="/Draven_Note_Images/Java/22.IO流/index/22. IO流_FileInputStream类：_11.png" alt="img" />

如果出现读取数据少于数组大小时怎么办？

```java
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;

public class FileStreamDemo2 {
    public static void main(String[] args) throws IOException {
        FileInputStream fis = new FileInputStream("day28_code\\src\\a.txt");
        FileOutputStream fos = new FileOutputStream("day28_code\\src\\b.txt");
        int b;
        byte[] by = new byte[2];
        while ((b = fis.read(by)) != -1) {
            String temp = new String(by, 0, b);
            fos.write(temp.getBytes());
        }
        fos.close();
        fis.close();
    }
}
```

---

#### 字符流：
<img src="/Draven_Note_Images/Java/22.IO流/index/22. IO流_字符流：_12.png" alt="img" />

##### FileReader类：
<img src="/Draven_Note_Images/Java/22.IO流/index/22. IO流_FileReader类：_13.png" alt="img" />

<img src="/Draven_Note_Images/Java/22.IO流/index/22. IO流_FileReader类：_14.png" alt="img" />

_**注意：**__“多个”说法因为可能是用GBK也可能是用UTF-8进行编码译码的，所以读到中文可能是多读一个或者两个。_

<img src="/Draven_Note_Images/Java/22.IO流/index/22. IO流_FileReader类：_15.png" alt="img" />

##### FileWriter类：
<img src="/Draven_Note_Images/Java/22.IO流/index/22. IO流_FileWriter类：_16.png" alt="img" />

<img src="/Draven_Note_Images/Java/22.IO流/index/22. IO流_FileWriter类：_17.png" alt="img" />

**书写细节：**

<img src="/Draven_Note_Images/Java/22.IO流/index/22. IO流_FileWriter类：_18.png" alt="img" />

##### 字符流底层逻辑：
<img src="/Draven_Note_Images/Java/22.IO流/index/22. IO流_字符流底层逻辑：_19.png" alt="img" />

<img src="/Draven_Note_Images/Java/22.IO流/index/22. IO流_字符流底层逻辑：_20.png" alt="img" />

##### flush和close：
<img src="/Draven_Note_Images/Java/22.IO流/index/22. IO流_flush和close：_21.png" alt="img" />

_**注意：**__flush只是将存储在内存的缓冲区中的数据弄进硬盘中，并没有彻底关闭通道。_

##### 例题：
<img src="/Draven_Note_Images/Java/22.IO流/index/22. IO流_例题：_22.png" alt="img" />

---

### IO高级流
#### 缓冲流：
<img src="/Draven_Note_Images/Java/22.IO流/index/22. IO流_缓冲流：_23.png" alt="img" />

<img src="/Draven_Note_Images/Java/22.IO流/index/22. IO流_缓冲流：_24.png" alt="img" />

##### 字节缓冲流底层逻辑：
<img src="/Draven_Note_Images/Java/22.IO流/index/22. IO流_字节缓冲流底层逻辑：_25.png" alt="img" />

##### 字符缓冲流构造方法：
<img src="/Draven_Note_Images/Java/22.IO流/index/22. IO流_字符缓冲流构造方法：_26.png" alt="img" />

_**注意：**__字节缓冲流的构造方法同理。_

##### 字符缓冲流的特有方法：
<img src="/Draven_Note_Images/Java/22.IO流/index/22. IO流_字符缓冲流的特有方法：_27.png" alt="img" />

_**注意：**__readLine方法在读取的时候，一次读一整行，遇到回车换行结束，但是它不会把回车换行读到内存当中。_

#### 转换流：
<img src="/Draven_Note_Images/Java/22.IO流/index/22. IO流_转换流：_28.jpeg" alt="img" />

##### 特点：
<img src="/Draven_Note_Images/Java/22.IO流/index/22. IO流_特点：_29.jpeg" alt="img" />

_**注意：**__转换流的主要作用就是让字节流可以使用字符流中特有的方法。_

#### 序列化/对象流：
_**注：**__就是能隐藏对象中的具体信息，弄成只有反序列化流才能读懂的字符。_

<img src="/Draven_Note_Images/Java/22.IO流/index/22. IO流_序列化_对象流：_30.jpeg" alt="img" />

##### 常用方法：
<img src="/Draven_Note_Images/Java/22.IO流/index/22. IO流_常用方法：_31.png" alt="img" />

<img src="/Draven_Note_Images/Java/22.IO流/index/22. IO流_常用方法：_32.png" alt="img" />

_**注意：**__被序列化的对象需要实现Serializable接口，这个是可以被序列化的标志，否则会报错，并且应该固定该对象的序列号，否则修改该对象里面的属性都话，序列号就会不一样，就无法从文件中进行反序列化了。_

<img src="/Draven_Note_Images/Java/22.IO流/index/22. IO流_常用方法：_33.png" alt="img" />

<img src="/Draven_Note_Images/Java/22.IO流/index/22. IO流_常用方法：_34.png" alt="img" />

_**注：**__若不希望该属性被写入文件，那么可以在属性类型前面加上transient。_

##### 细节汇总：
<img src="/Draven_Note_Images/Java/22.IO流/index/22. IO流_细节汇总：_35.png" alt="img" />

⑤ 可以用ArrayList容器作为对象存入，这样就不用等到它报错了才知道读取完了（如下图）。

<img src="/Draven_Note_Images/Java/22.IO流/index/22. IO流_细节汇总：_36.png" alt="img" />

#### 打印流：
<img src="/Draven_Note_Images/Java/22.IO流/index/22. IO流_打印流：_37.png" alt="img" />

<img src="/Draven_Note_Images/Java/22.IO流/index/22. IO流_打印流：_38.png" alt="img" />

##### 字节打印流：
<img src="/Draven_Note_Images/Java/22.IO流/index/22. IO流_字节打印流：_39.png" alt="img" />

<img src="/Draven_Note_Images/Java/22.IO流/index/22. IO流_字节打印流：_40.png" alt="img" />

##### 字符打印流：
<img src="/Draven_Note_Images/Java/22.IO流/index/22. IO流_字符打印流：_41.png" alt="img" />

<img src="/Draven_Note_Images/Java/22.IO流/index/22. IO流_字符打印流：_42.png" alt="img" />

#### 解压缩/压缩流：
<img src="/Draven_Note_Images/Java/22.IO流/index/22. IO流_解压缩_压缩流：_43.png" alt="img" />

##### 解压缩流：
<img src="/Draven_Note_Images/Java/22.IO流/index/22. IO流_解压缩流：_44.png" alt="img" />

<img src="/Draven_Note_Images/Java/22.IO流/index/22. IO流_解压缩流：_45.png" alt="img" />

##### 压缩流：
<img src="/Draven_Note_Images/Java/22.IO流/index/22. IO流_压缩流：_46.png" alt="img" />

<img src="/Draven_Note_Images/Java/22.IO流/index/22. IO流_压缩流：_47.png" alt="img" />
