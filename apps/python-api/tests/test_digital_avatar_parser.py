from python_api.modules.digital_avatar.parser import parse_digital_avatar_text


def test_splits_only_second_level_headings_and_derives_summary() -> None:
    parsed = parse_digital_avatar_text(
        "课程说明\r\n\r\n## 第一节\r\n正文\r\n### 子标题\r\n细节\r\n## 结语\r\n总结 **原文**"
    )

    assert [item.content for item in parsed.chunks] == [
        "课程说明",
        "## 第一节\n正文\n### 子标题\n细节",
        "## 结语\n总结 **原文**",
    ]
    assert [item.heading for item in parsed.chunks] == [None, "第一节", "结语"]
    assert [item.is_summary for item in parsed.chunks] == [False, False, True]
    assert parsed.summary == "总结 **原文**"


def test_keeps_a_long_section_as_one_chunk() -> None:
    body = "长" * 4306
    parsed = parse_digital_avatar_text(f"## 超长章节\n{body}\n## 总结\n完成")

    assert len(parsed.chunks) == 2
    assert parsed.chunks[0].content == f"## 超长章节\n{body}"


def test_uses_whole_document_without_headings_and_leaves_summary_empty() -> None:
    parsed = parse_digital_avatar_text("全文\n### 三级标题\n内容")

    assert [item.content for item in parsed.chunks] == ["全文\n### 三级标题\n内容"]
    assert parsed.summary == ""


def test_omits_an_empty_final_section_and_keeps_contiguous_chunks() -> None:
    parsed = parse_digital_avatar_text("前言\n## 正文\n内容\n## 总结\n   ")

    assert [item.content for item in parsed.chunks] == ["前言", "## 正文\n内容"]
    assert parsed.summary == ""


def test_matches_the_management_document_package_shape() -> None:
    from pathlib import Path

    root = Path(__file__).resolve().parents[3] / "data" / "管理知识文档"
    files = sorted(root.glob("*.txt"))
    parsed = [parse_digital_avatar_text(path.read_text(encoding="utf-8")) for path in files]

    assert len(files) == 39
    assert sum(len(item.chunks) for item in parsed) == 268
    assert all(item.summary for item in parsed)
