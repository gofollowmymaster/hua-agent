import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SemanticTag } from './index';

describe('SemanticTag', () => {
  it('applies a light semantic tone without Ant preset color classes', () => {
    render(<SemanticTag tone="success">ready</SemanticTag>);

    const tag = screen.getByText('ready');
    expect(tag).toHaveClass('semantic-tag', 'semantic-tag-success');
    expect(tag.className).not.toContain('ant-tag-success');
  });
});
