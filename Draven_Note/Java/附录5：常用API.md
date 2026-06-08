# 附录5：常用API

![[Draven_Note_Images/Java/附录5：常用API/附录5：常用API_01.png]]

### Math：

![[Draven_Note_Images/Java/附录5：常用API/附录5：常用API_Math：_02.png]]

```java
public static double sqrt(double a)   返回a的平方根
``````java
public static double cbrt(double a)   返回a的立方根
``````java
public static int/long absExact(int/long a)   返回a的绝对值，能抛出异常
```

![[Draven_Note_Images/Java/附录5：常用API/附录5：常用API_Math：_03.png]]

### System：

![[Draven_Note_Images/Java/附录5：常用API/附录5：常用API_System：_04.png]]

![[Draven_Note_Images/Java/附录5：常用API/附录5：常用API_System：_05.png]]

### Runtime：

![[Draven_Note_Images/Java/附录5：常用API/附录5：常用API_Runtime：_06.png]]

![[Draven_Note_Images/Java/附录5：常用API/附录5：常用API_Runtime：_07.png]]

### Objec：

![[Draven_Note_Images/Java/附录5：常用API/附录5：常用API_Objec：_08.png]]

![[Draven_Note_Images/Java/附录5：常用API/附录5：常用API_Objec：_09.png]]

![[Draven_Note_Images/Java/附录5：常用API/附录5：常用API_Objec：_10.png]]

![[Draven_Note_Images/Java/附录5：常用API/附录5：常用API_Objec：_11.png]]

### Objects：

![[Draven_Note_Images/Java/附录5：常用API/附录5：常用API_Objects：_12.png]]

![[Draven_Note_Images/Java/附录5：常用API/附录5：常用API_Objects：_13.png]]

### BigInteger：

![[Draven_Note_Images/Java/附录5：常用API/附录5：常用API_BigInteger：_14.png]]

![[Draven_Note_Images/Java/附录5：常用API/附录5：常用API_BigInteger：_15.png]]

**注意：** 对象一旦创建，那么内部记录的值是无法更改的。

![[Draven_Note_Images/Java/附录5：常用API/附录5：常用API_BigInteger：_16.png]]

![[Draven_Note_Images/Java/附录5：常用API/附录5：常用API_BigInteger：_17.png]]

### BigDecimal：

![[Draven_Note_Images/Java/附录5：常用API/附录5：常用API_BigDecimal：_18.png]]

![[Draven_Note_Images/Java/附录5：常用API/附录5：常用API_BigDecimal：_19.png]]

### 时间相关类（JDK7以前）

#### Date(时间)：

![[Draven_Note_Images/Java/附录5：常用API/附录5：常用API_Date_时间_：_20.png]]

#### SimpleDateFormat(格式化时间)：

![[Draven_Note_Images/Java/附录5：常用API/附录5：常用API_SimpleDateFormat_格式化_21.png]]![[Draven_Note_Images/Java/附录5：常用API/附录5：常用API_SimpleDateFormat_格式化_22.png]]

![[Draven_Note_Images/Java/附录5：常用API/附录5：常用API_SimpleDateFormat_格式化_23.png]]

##### 练习1：

```java
public static void main(String[] args) throws ParseException {
    /*
        假设，你初恋的出生年月日为：2000-11-11
        请用字符串表示这个数据，并将其转换为：2000年11月11日
     */
    String birth = "2000-11-11";
    // 先将已知格式的数据转换位Date类
    SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
    Date d = sdf.parse(birth);
    // 再将Date类数据转换为想要的格式
    SimpleDateFormat res = new SimpleDateFormat("yyyy年MM月dd日");
    String s = res.format(d);
    // 输出结果
    System.out.println(s);
}
```

##### 练习2：

```java
public static void main(String[] args) throws ParseException {
    /*
        秒杀活动的时间为：2023年11月11日 0:00:00-2023年11月11日 0:10:00
        需求:
            小贾下单并付款的时间为：2023年11月11日 0:01:00
            小皮下单并付款的时间为：2023年11月11日 0:11:0
            用代码说明这两位同学有没有参加上秒杀活动？
     */
    // 先把已知信息装进字符串内
    String startTime = "2023年11月11日 00:00:00";
    String endTime = "2023年11月11日 0:10:00";
    String orderTime = "2023年11月11日 0:01:00";

    // 将字符串中的时间变成对应的Date类
    SimpleDateFormat sdf = new SimpleDateFormat("yyyy年MM月dd日 hh:mm:ss");
    Date startDate = sdf.parse(startTime);
    Date endDate = sdf.parse(endTime);
    Date orderDate = sdf.parse(orderTime);

    // 计算三个时间的毫秒值
    long start = startDate.getTime();
    long end = endDate.getTime();
    long order = orderDate.getTime();

    // 判断其是否在下单时间范围内
    if (start <= order&& end >= order) {
        System.out.println("恭喜你，抢购成功！");
    } else {
        System.out.println("很遗憾，抢购失败");
    }
}
```

#### Calendar(日历)：

![[Draven_Note_Images/Java/附录5：常用API/附录5：常用API_Calendar_日历_：_24.png]]

![[Draven_Note_Images/Java/附录5：常用API/附录5：常用API_Calendar_日历_：_25.png]]

![[Draven_Note_Images/Java/附录5：常用API/附录5：常用API_Calendar_日历_：_26.png]]

![[Draven_Note_Images/Java/附录5：常用API/附录5：常用API_Calendar_日历_：_27.png]]

### 时间相关类（JDK8）

**注意：** 时间日期对象都是不可变的。

![[Draven_Note_Images/Java/附录5：常用API/附录5：常用API_时间相关类（JDK8）_28.png]]

#### ZoneId：

![[Draven_Note_Images/Java/附录5：常用API/附录5：常用API_ZoneId：_29.png]]

![[Draven_Note_Images/Java/附录5：常用API/附录5：常用API_ZoneId：_30.png]]

#### Instant：

![[Draven_Note_Images/Java/附录5：常用API/附录5：常用API_Instant：_31.png]]

```java
public static void main(String[] args) {
    Instant instant1 = Instant.now();

    // 1. 根据（秒/毫秒/纳秒）获取Instant对象
    Instant instant2 = Instant.ofEpochMilli(1000L);
    Instant instant3 = Instant.ofEpochSecond(2L);
    Instant instant4 = Instant.ofEpochSecond(2L, 1000000000L);

    System.out.println(instant2);
    System.out.println(instant3);
    System.out.println(instant4);

    // 2. 判断系列的方法
    boolean before = instant2.isBefore(instant3); // 判断instant2是否在instant3之前
    boolean after = instant2.isAfter(instant3); // 判断instant2是否在instant3之后

    System.out.println(before);
    System.out.println(after);

    // 3. 减少时间系列的方法
    Instant instant5 = instant3.minusSeconds(2L);
    Instant instant6 = instant4.minusMillis(3000L);
    System.out.println(instant5);
    System.out.println(instant6);

    // 4. 增加时间系列的方法
    Instant instant7 = instant5.plusSeconds(2L);
    Instant instant8 = instant6.plusMillis(3000L);
    System.out.println(instant7);
    System.out.println(instant8);
}
```

#### ZoneDateTime：

![[Draven_Note_Images/Java/附录5：常用API/附录5：常用API_ZoneDateTime：_32.png]]

```java
public static void main(String[] args) {
    // 1. 获取当前时间对象（带时区）
    ZonedDateTime now = ZonedDateTime.now();
    System.out.println(now);

    // 2. 获取指定的时间对象（带时区）
    // 年月日时分秒纳秒方式指定
    ZonedDateTime time1 = ZonedDateTime.of(2025, 12, 1, 0,
                                           57, 13, 0,
                                           ZoneId.of("Asia/Shanghai"));
    System.out.println(time1);

    // 3.修改时间系列的方法
    ZonedDateTime time2 = time1.withYear(2026);
    System.out.println(time2);

    // 4. 减少时间
    ZonedDateTime time3 = time2.minusDays(2);
    System.out.println(time3);

    // 5. 增加时间
    ZonedDateTime time4 = time3.plusDays(2);
    System.out.println(time4);
}
```

#### DateTimeFormatter：

用于时间的格式化和解析。

![[Draven_Note_Images/Java/附录5：常用API/附录5：常用API_DateTimeFormatter：_33.png]]

#### LocalDate、LocalTime、LocalDateTime：

![[Draven_Note_Images/Java/附录5：常用API/附录5：常用API_LocalDate、LocalTime、_34.png]]

![[Draven_Note_Images/Java/附录5：常用API/附录5：常用API_LocalDate、LocalTime、_35.png]]

#### Duration、Period、ChronoUnit：

![[Draven_Note_Images/Java/附录5：常用API/附录5：常用API_Duration、Period、Chro_36.png]]

**Duration：**

![[Draven_Note_Images/Java/附录5：常用API/附录5：常用API_Duration、Period、Chro_37.png]]

**Period：**

![[Draven_Note_Images/Java/附录5：常用API/附录5：常用API_Duration、Period、Chro_38.png]]

**ChronoUnit：**

![[Draven_Note_Images/Java/附录5：常用API/附录5：常用API_Duration、Period、Chro_39.png]]

**注意：** 方法是用第二个参数减去第一个参数。

### 包装类

![[Draven_Note_Images/Java/附录5：常用API/附录5：常用API_包装类_40.png]]

![[Draven_Note_Images/Java/附录5：常用API/附录5：常用API_包装类_41.png]]

![[Draven_Note_Images/Java/附录5：常用API/附录5：常用API_包装类_42.png]]

**注：** JDK5以前。

![[Draven_Note_Images/Java/附录5：常用API/附录5：常用API_包装类_43.png]]

![[Draven_Note_Images/Java/附录5：常用API/附录5：常用API_包装类_44.png]]

#### Integer：

![[Draven_Note_Images/Java/附录5：常用API/附录5：常用API_Integer：_45.png]]

```java
public static void main(String[] args) {
    /*
        键盘录入一些1~100之间的整数，并添加到集合，
        直到集合中所有数据和超过200为止。
    */
    ArrayList<Integer> list = new ArrayList<>();
    Scanner sc = new Scanner(System.in);
    int sum = 0;
    while (true) {
        String numStr = sc.nextLine();
        int num = Integer.parseInt(numStr);
        if (num < 1 || num > 100) {
            System.out.println("输入的数字不合法，请重新输入！");
            continue;
        }
        list.add(num);
        sum += num;
        if (sum > 200) {
            break;
        }
    }
    for (Integer integer : list) {
        System.out.println(integer);
    }
    System.out.println(sum);
}
```

```java
public static void main(String[] args) {
    /*
        自己实现parselnt方法的效果，将字符串形式的数据转成整数。
        要求：
            字符串中只能是数字不能有其他字符;
            最少一位，最多10位;
            0不能开头。
     */
    Scanner sc = new Scanner(System.in);
    String s = sc.nextLine();
    int num = parseInt(s);
    System.out.println(num);
}
public static int parseInt(String str) {
if (!str.matches("[0-9]\\d{0,9}")) {
    return -1;
}
int res = 0;
for (int i = 0; i < str.length(); i++) {
    if (str.charAt(i) < '0' || str.charAt(i) > '9') {
        return -1;
    }
    res = res * 10 + (str.charAt(i)-'0');
}
return res;
}
```

```java
public static void main(String[] args) {
    /*
        定义一个方法自己实现toBinaryString方法的效果，将一个十制整数转成字符串表示的二进制
     */
    Scanner sc = new Scanner(System.in);
    String numStr = sc.nextLine();
    int num = Integer.parseInt(numStr);
    System.out.println(toBinaryString(num));
    System.out.println(Integer.toBinaryString(num));
}

public static String toBinaryString(int num) {
    StringBuilder res = new StringBuilder();
    while(num!=0) {
        res.insert(0, num%2);
        num/=2;
    }
    return res.toString();
}
```

### Arrays：

![[Draven_Note_Images/Java/附录5：常用API/附录5：常用API_Arrays：_46.png]]

![[Draven_Note_Images/Java/附录5：常用API/附录5：常用API_Arrays：_47.png]]

![[Draven_Note_Images/Java/附录5：常用API/附录5：常用API_Arrays：_48.png]]

![[Draven_Note_Images/Java/附录5：常用API/附录5：常用API_Arrays：_49.png]]

![[Draven_Note_Images/Java/附录5：常用API/附录5：常用API_Arrays：_50.png]]

![[Draven_Note_Images/Java/附录5：常用API/附录5：常用API_Arrays：_51.png]]
