import type { ReactNode } from 'react';
import { Tag } from 'antd';
import './style.css';

export type SemanticTagTone =
  | 'neutral'
  | 'info'
  | 'success'
  | 'warning'
  | 'error';

export function SemanticTag({
  children,
  tone = 'neutral',
}: {
  children: ReactNode;
  tone?: SemanticTagTone;
}) {
  return (
    <Tag className={`semantic-tag semantic-tag-${tone}`}>{children}</Tag>
  );
}
