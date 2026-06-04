'use client';

import { createCache, extractStyle, StyleProvider } from '@ant-design/cssinjs';
import { useServerInsertedHTML } from 'next/navigation';
import { useMemo } from 'react';

export default function AntdRegistry({ children }: { children: React.ReactNode }) {
  const cache = useMemo(() => createCache(), []);

  useServerInsertedHTML(() => {
    const styleText = extractStyle(cache, true);
    return <style id="antd" dangerouslySetInnerHTML={{ __html: styleText }} />;
  });

  return <StyleProvider cache={cache}>{children}</StyleProvider>;
}

