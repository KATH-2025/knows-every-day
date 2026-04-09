import { NextRequest, NextResponse } from "next/server";
import postsData from "@/lib/posts-data.json";

type PostEntry = { content: string; ext: string };
const data = postsData as Record<string, PostEntry>;

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  // 安全检查：防止路径穿越
  if (!slug || slug.includes("..") || slug.includes("/")) {
    return new NextResponse("Not found", { status: 404 });
  }

  const entry = data[slug];
  if (!entry || entry.ext !== ".html") {
    return new NextResponse("Not found", { status: 404 });
  }

  // 去掉顶部 JSON 元数据注释，返回纯 HTML
  let html = entry.content.replace(/^<!--\s*\{[\s\S]*?\}\s*-->/, "").trim();

  // 注入划线通信脚本：把选中文字通过 postMessage 发给父页面
  const selectionScript = `
<script>
(function(){
  function sendClear(){ window.parent.postMessage({type:'ke-selection-clear'},'*'); }
  document.addEventListener('mouseup',function(){
    var sel=window.getSelection();
    if(!sel||sel.isCollapsed||!sel.toString().trim()){ sendClear(); return; }
    var text=sel.toString().trim();
    if(text.length<5){ sendClear(); return; }
    var range=sel.getRangeAt(0);
    var r=range.getBoundingClientRect();
    window.parent.postMessage({type:'ke-text-selected',text:text,rect:{top:r.top,left:r.left,width:r.width,height:r.height}},'*');
  });
  document.addEventListener('mousedown',function(){
    var sel=window.getSelection();
    if(!sel||sel.isCollapsed) sendClear();
  });
})();
</script>`;

  // 插入到 </body> 前，没有则追加末尾
  if (html.includes("</body>")) {
    html = html.replace("</body>", selectionScript + "\n</body>");
  } else {
    html = html + selectionScript;
  }

  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store", // 注入脚本后不缓存，避免旧版本
    },
  });
}
