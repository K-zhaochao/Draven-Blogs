---
order: 999
title: "TreeMap核心源码相关知识点"
---

# TreeMap 核心源码相关知识点

## 1. TreeMap 中每一个节点的内部属性

```java
K key;					//键
V value;				//值
Entry&lt;K,V&gt; left;		//左子节点
Entry&lt;K,V&gt; right;		//右子节点
Entry&lt;K,V&gt; parent;		//父节点
boolean color;			//节点的颜色
```

## 2. TreeMap 类中的核心成员变量

```java
public class TreeMap&lt;K,V&gt;{
    //比较器对象，用于自定义键的比较规则
    private final Comparator<? super K> comparator;

    //红黑树的根节点
    private transient Entry&lt;K,V&gt; root;

    //集合中元素的数量（红黑树的节点数）
    private transient int size = 0;
}
```

## 3. TreeMap 的构造方法

### 3.1 空参构造

```java
//空参构造：不传递比较器对象，使用键的自然排序（要求键实现Comparable接口）
public TreeMap() {
    comparator = null;
}
```

### 3.2 带参构造

```java
//带参构造：传递比较器对象，使用比较器的规则进行排序
public TreeMap(Comparator<? super K> comparator) {
    this.comparator = comparator;
}
```

## 4. TreeMap 添加元素的核心源码及解释

### 4.1 对外暴露的 put 方法

```java
//参数一：键
//参数二：值
//返回值：被覆盖的旧值，无覆盖则返回null
public V put(K key, V value) {
    return put(key, value, true);
}
```

### 4.2 核心 put 逻辑方法

```java
//参数一：键
//参数二：值
//参数三：当键重复时是否覆盖值（true：覆盖；false：不覆盖）
private V put(K key, V value, boolean replaceOld) {
    //获取根节点的地址值，赋值给局部变量t
    Entry&lt;K,V&gt; t = root;
    //判断根节点是否为null（第一次添加元素）
    if (t == null) {
        //底层创建Entry对象，作为根节点
        addEntryToEmptyMap(key, value);
        //无覆盖，返回null
        return null;
    }
    //存储两个键比较后的结果
    int cmp;
    //存储当前要添加节点的父节点
    Entry&lt;K,V&gt; parent;
    //获取比较器对象
    Comparator<? super K> cpr = comparator;

    //判断是否存在自定义比较器
    if (cpr != null) {
        //有比较器：使用比较器的compare方法进行排序
        do {
            parent = t;
            //比较当前键与节点的键
            cmp = cpr.compare(key, t.key);
            if (cmp < 0) {
                //当前键更小，向左子树查找
                t = t.left;
            } else if (cmp > 0) {
                //当前键更大，向右子树查找
                t = t.right;
            } else {
                //键重复，处理值的覆盖
                V oldValue = t.value;
                if (replaceOld || oldValue == null) {
                    t.value = value;
                }
                //返回被覆盖的旧值
                return oldValue;
            }
        } while (t != null);
    } else {
        //无比较器：使用键的自然排序（要求键实现Comparable接口）
        Comparable<? super K> k = (Comparable<? super K>) key;
        do {
            parent = t;
            //调用Comparable的compareTo方法比较
            cmp = k.compareTo(t.key);
            if (cmp < 0) {
                t = t.left;
            } else if (cmp > 0) {
                t = t.right;
            } else {
                //键重复，覆盖值
                V oldValue = t.value;
                if (replaceOld || oldValue == null) {
                    t.value = value;
                }
                return oldValue;
            }
        } while (t != null);
    }
    //找到父节点后，添加新节点（cmp < 0 表示添加到左子节点，否则到右子节点）
    addEntry(key, value, parent, cmp < 0);
    //无覆盖，返回null
    return null;
}
```

### 4.3 新增节点的方法

```java
private void addEntry(K key, V value, Entry&lt;K, V&gt; parent, boolean addToLeft) {
    //创建新的Entry节点，指定父节点
    Entry&lt;K,V&gt; e = new Entry<>(key, value, parent);
    if (addToLeft) {
        //添加为父节点的左子节点
        parent.left = e;
    } else {
        //添加为父节点的右子节点
        parent.right = e;
    }
    //添加后，按照红黑树的规则调整节点颜色和结构
    fixAfterInsertion(e);
    //集合长度+1
    size++;
    //修改次数+1（快速失败机制用）
    modCount++;
}
```

### 4.4 红黑树插入后的调整方法

```java
private void fixAfterInsertion(Entry&lt;K,V&gt; x) {
    //红黑树节点默认颜色为红色
    x.color = RED;

    //循环调整：当前节点不是根节点，且父节点为红色（违反红黑树规则）
    while (x != null && x != root && x.parent.color == RED) {
        //判断父节点是爷爷节点的左子节点还是右子节点（用于获取叔叔节点）
        if (parentOf(x) == leftOf(parentOf(parentOf(x)))) {
            //父节点是爷爷节点的左子节点，叔叔节点为爷爷节点的右子节点
            Entry&lt;K,V&gt; y = rightOf(parentOf(parentOf(x)));
            if (colorOf(y) == RED) {
                //情况1：叔叔节点为红色
                setColor(parentOf(x), BLACK); //父节点设为黑色
                setColor(y, BLACK); //叔叔节点设为黑色
                setColor(parentOf(parentOf(x)), RED); //爷爷节点设为红色
                x = parentOf(parentOf(x)); //将爷爷节点作为当前节点，继续循环检查
            } else {
                //情况2：叔叔节点为黑色
                if (x == rightOf(parentOf(x))) {
                    //当前节点是父节点的右子节点，先左旋父节点
                    x = parentOf(x);
                    rotateLeft(x);
                }
                //父节点设为黑色，爷爷节点设为红色，右旋爷爷节点
                setColor(parentOf(x), BLACK);
                setColor(parentOf(parentOf(x)), RED);
                rotateRight(parentOf(parentOf(x)));
            }
        } else {
            //父节点是爷爷节点的右子节点，叔叔节点为爷爷节点的左子节点
            Entry&lt;K,V&gt; y = leftOf(parentOf(parentOf(x)));
            if (colorOf(y) == RED) {
                //情况1：叔叔节点为红色
                setColor(parentOf(x), BLACK);
                setColor(y, BLACK);
                setColor(parentOf(parentOf(x)), RED);
                x = parentOf(parentOf(x));
            } else {
                //情况2：叔叔节点为黑色
                if (x == leftOf(parentOf(x))) {
                    //当前节点是父节点的左子节点，先右旋父节点
                    x = parentOf(x);
                    rotateRight(x);
                }
                //父节点设为黑色，爷爷节点设为红色，左旋爷爷节点
                setColor(parentOf(x), BLACK);
                setColor(parentOf(parentOf(x)), RED);
                rotateLeft(parentOf(parentOf(x)));
            }
        }
    }
    //红黑树的根节点永远是黑色
    root.color = BLACK;
}

// 以下是上述代码中用到的辅助方法（源码中存在，此处补充便于理解）
private Entry&lt;K,V&gt; parentOf(Entry&lt;K,V&gt; e) {
    return (e == null) ? null : e.parent;
}

private Entry&lt;K,V&gt; leftOf(Entry&lt;K,V&gt; e) {
    return (e == null) ? null : e.left;
}

private Entry&lt;K,V&gt; rightOf(Entry&lt;K,V&gt; e) {
    return (e == null) ? null : e.right;
}

private boolean colorOf(Entry&lt;K,V&gt; e) {
    return (e == null) ? BLACK : e.color;
}

private void setColor(Entry&lt;K,V&gt; e, boolean color) {
    if (e != null) {
        e.color = color;
    }
}

// 左旋、右旋方法（源码中存在，此处简化示意）
private void rotateLeft(Entry&lt;K,V&gt; x) { /* 左旋逻辑 */ }
private void rotateRight(Entry&lt;K,V&gt; x) { /* 右旋逻辑 */ }

// 红黑树颜色常量（源码中定义）
private static final boolean RED = false;
private static final boolean BLACK = true;
```

## 5. 思考问题

### 5.1 TreeMap添加元素时，键是否需要重写hashCode和equals方法？

不需要。TreeMap是基于红黑树的排序结构，通过**比较器（Comparator）**或**自然排序（Comparable）**来判断键的唯一性，而非哈希值和equals方法。

### 5.2 HashMap的键是否需要实现Comparable接口或传递比较器对象？

不需要。HashMap的红黑树是基于**哈希值的大小关系**来构建的，并非通过键的比较器或自然排序，因此不需要键实现Comparable接口。

### 5.3 TreeMap和HashMap谁的效率更高？

* **最坏情况**：HashMap中某一索引位置形成长度为8的链表时，TreeMap的增删查效率更高（红黑树时间复杂度O(logn)，链表O(n)）。
* **一般情况**：HashMap效率更高（哈希表的增删查时间复杂度接近O(1)，红黑树为O(logn)）。

### 5.4 Map集合中是否有键重复时不覆盖的put方法？

有（如`putIfAbsent`方法）。核心思想：代码逻辑通常有两面性，若存在布尔/数值变量控制逻辑走向，该逻辑必然有对应的反向实现（布尔变量控制两面，数值变量控制多面）。

### 5.5 双列集合（HashMap、LinkedHashMap、TreeMap）的选择策略

* **默认选择**：HashMap（效率最高）。
* **需要存取有序**：LinkedHashMap（继承HashMap，维护双向链表保证顺序）。
* **需要排序**：TreeMap（基于红黑树实现键的排序）。

***

### 总结

1. TreeMap 底层是红黑树结构，节点包含键、值、父子节点和颜色属性，依赖比较器或自然排序实现键的排序与唯一性判断。
2. TreeMap 的`put`方法核心是通过比较找到节点位置，键重复时覆盖值，新增节点后会按红黑树规则调整结构。
3. 双列集合选择需根据需求：追求效率选HashMap，需要有序选LinkedHashMap，需要排序选TreeMap。
