import { Empty } from 'antd';

export function ModulePlaceholder() {
  return (
    <div
      style={{
        display: 'grid',
        minHeight: 360,
        background: '#fff',
        placeItems: 'center',
      }}
    >
      <Empty description="模块建设中" />
    </div>
  );
}
