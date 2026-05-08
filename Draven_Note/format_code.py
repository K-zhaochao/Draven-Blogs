import os
import re

root_dir = r"f:\Develop\Obsidian\Draven_Note"

def is_code_line(line):
    # Very basic heuristic for Java code lines
    code_indicators = [
        "public class ", "public static ", "private ", "protected ", 
        "import java.", "package ", "System.out.println", "void main",
        "String[] ", "int[] ", "return "
    ]
    return any(indicator in line for indicator in code_indicators) or line.strip().startswith("//") or line.strip().endswith(";") or line.strip().endswith("{") or line.strip() == "}"

count_modified = 0

for dirpath, dirnames, filenames in os.walk(root_dir):
    if '.obsidian' in dirpath:
        continue
        
    for filename in filenames:
        if filename.endswith(".md"):
            filepath = os.path.join(dirpath, filename)
            try:
                with open(filepath, 'r', encoding='utf-8') as f:
                    lines = f.readlines()
            except Exception:
                continue
            
            in_code_block = False
            new_lines = []
            
            code_buffer = []
            
            def flush_code_buffer():
                if not code_buffer:
                    return []
                # If there are just 1-2 lines and they aren't very clearly a large code block, 
                # we might just leave them, but the user asked to format code. 
                # Let's wrap if > 1 line of actual code, or if it obviously contains class/methods.
                if len([l for l in code_buffer if l.strip()]) > 0:
                    merged = "".join(code_buffer)
                    return ["```java\n", merged, "```\n"]
                else:
                    return code_buffer
            
            for line in lines:
                if line.strip().startswith("```"):
                    if in_code_block:
                        in_code_block = False
                    else:
                        if code_buffer:
                            new_lines.extend(flush_code_buffer())
                            code_buffer = []
                        in_code_block = True
                    new_lines.append(line)
                    continue
                
                if in_code_block:
                    new_lines.append(line)
                else:
                    # check if current line looks like orphan code
                    if is_code_line(line) and not line.strip().startswith("-") and not line.strip().startswith("*") and not line.strip().startswith("#"):
                        code_buffer.append(line)
                    else:
                        if code_buffer:
                            # We received a non-code line. Flush code buffer.
                            # But wait, sometimes a blank line is between code lines.
                            if line.strip() == "":
                                code_buffer.append(line)
                                continue
                            else:
                                new_lines.extend(flush_code_buffer())
                                code_buffer = []
                        new_lines.append(line)
            
            if code_buffer:
                new_lines.extend(flush_code_buffer())
                
            new_content = "".join(new_lines)
            with open(filepath, 'r', encoding='utf-8') as f:
                old_content = f.read()
                
            if new_content != old_content:
                if '17.正则表达式.md' in filepath:
                    with open(filepath + ".test", 'w', encoding='utf-8') as ft:
                        ft.write(new_content)
                count_modified += 1

print(f"Would modify {count_modified} files.")
