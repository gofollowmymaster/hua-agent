from __future__ import annotations

import ast
import operator
from collections.abc import Callable
from datetime import datetime
from zoneinfo import ZoneInfo

_BINARY_OPERATORS: dict[type[ast.operator], Callable[[float, float], float]] = {
    ast.Add: operator.add,
    ast.Sub: operator.sub,
    ast.Mult: operator.mul,
    ast.Div: operator.truediv,
}
_UNARY_OPERATORS: dict[type[ast.unaryop], Callable[[float], float]] = {
    ast.UAdd: operator.pos,
    ast.USub: operator.neg,
}


def current_time() -> str:
    """Formats the current time using the bundled Shanghai time zone data."""
    return datetime.now(ZoneInfo("Asia/Shanghai")).strftime("%Y年%m月%d日 %A %H:%M:%S")


def calculate_expression(expression: str) -> int | float:
    """Evaluates only numeric literals and basic arithmetic operators."""
    if len(expression) > 200:
        raise ValueError("表达式过长")

    def evaluate(node: ast.AST) -> float:
        if isinstance(node, ast.Expression):
            return evaluate(node.body)
        if isinstance(node, ast.Constant) and isinstance(node.value, (int, float)):
            return float(node.value)
        if isinstance(node, ast.BinOp) and type(node.op) in _BINARY_OPERATORS:
            return _BINARY_OPERATORS[type(node.op)](evaluate(node.left), evaluate(node.right))
        if isinstance(node, ast.UnaryOp) and type(node.op) in _UNARY_OPERATORS:
            return _UNARY_OPERATORS[type(node.op)](evaluate(node.operand))
        raise ValueError("只支持数字、括号和 + - * / 运算")

    result = evaluate(ast.parse(expression, mode="eval"))
    return int(result) if result.is_integer() else result
