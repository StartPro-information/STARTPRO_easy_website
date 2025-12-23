import React, { useState } from 'react';

interface CustomBlockEditorProps {
  value?: {
    html?: string;
    css?: string;
  };
  onChange: (content: { html: string; css: string }) => void;
}

const CustomBlockEditor: React.FC<CustomBlockEditorProps> = ({
  value = { html: '', css: '' },
  onChange
}) => {
  // 组件状态
  const [components, setComponents] = useState<any[]>(() => {
    if (value.html) {
      // 从HTML中解析出组件（简化处理）
      return [{ id: 1, type: 'container', children: [] }];
    }
    return [{ id: 1, type: 'container', children: [] }];
  });

  // 当前选中的组件
  const [selectedComponent, setSelectedComponent] = useState<number | null>(1);

  // 添加组件
  const addComponent = (type: string) => {
    const newComponent = {
      id: Date.now(),
      type,
      props: getDefaultProps(type)
    };

    setComponents(prev => [...prev, newComponent]);
    setSelectedComponent(newComponent.id);
  };

  // 获取默认属性
  const getDefaultProps = (type: string) => {
    switch (type) {
      case 'text':
        return {
          content: '这是一段文本内容',
          fontSize: '16px',
          color: '#333333',
          textAlign: 'left'
        };
      case 'heading':
        return {
          content: '标题',
          level: 'h2',
          fontSize: '24px',
          color: '#222222',
          textAlign: 'left'
        };
      case 'image':
        return {
          src: '/images/placeholder.jpg',
          alt: '图片描述',
          width: '100%',
          height: 'auto',
          borderRadius: '0px'
        };
      case 'button':
        return {
          text: '按钮',
          backgroundColor: '#007bff',
          color: '#ffffff',
          padding: '12px 24px',
          borderRadius: '4px'
        };
      case 'container':
        return {
          padding: '20px',
          backgroundColor: '#ffffff',
          borderRadius: '0px'
        };
      default:
        return {};
    }
  };

  // 更新组件属性
  const updateComponentProps = (id: number, props: any) => {
    setComponents(prev =>
      prev.map(comp =>
        comp.id === id ? { ...comp, props: { ...comp.props, ...props } } : comp
      )
    );
  };

  // 生成HTML和CSS
  const generateOutput = () => {
    let html = '';
    let css = '';

    components.forEach(comp => {
      switch (comp.type) {
        case 'text':
          html += `<div class="custom-text-${comp.id}">${comp.props.content}</div>`;
          css += `.custom-text-${comp.id} {
  font-size: ${comp.props.fontSize};
  color: ${comp.props.color};
  text-align: ${comp.props.textAlign};
  line-height: 1.6;
}\n\n`;
          break;
        case 'heading':
          html += `<${comp.props.level} class="custom-heading-${comp.id}">${comp.props.content}</${comp.props.level}>`;
          css += `.custom-heading-${comp.id} {
  font-size: ${comp.props.fontSize};
  color: ${comp.props.color};
  text-align: ${comp.props.textAlign};
  margin-bottom: 15px;
}\n\n`;
          break;
        case 'image':
          html += `<img src="${comp.props.src}" alt="${comp.props.alt}" class="custom-image-${comp.id}" />`;
          css += `.custom-image-${comp.id} {
  width: ${comp.props.width};
  height: ${comp.props.height};
  border-radius: ${comp.props.borderRadius};
}\n\n`;
          break;
        case 'button':
          html += `<button class="custom-button-${comp.id}">${comp.props.text}</button>`;
          css += `.custom-button-${comp.id} {
  background-color: ${comp.props.backgroundColor};
  color: ${comp.props.color};
  padding: ${comp.props.padding};
  border-radius: ${comp.props.borderRadius};
  border: none;
  cursor: pointer;
}\n\n`;
          break;
        case 'container':
          html += `<div class="custom-container-${comp.id}">组件将添加到这里</div>`;
          css += `.custom-container-${comp.id} {
  padding: ${comp.props.padding};
  background-color: ${comp.props.backgroundColor};
  border-radius: ${comp.props.borderRadius};
}\n\n`;
          break;
      }
    });

    return { html, css };
  };

  // 当组件变化时通知父组件
  React.useEffect(() => {
    const { html, css } = generateOutput();
    onChange({ html, css });
  }, [components]);

  // 获取选中组件
  const selectedComp = components.find(comp => comp.id === selectedComponent);

  return (
    <div className="custom-block-editor space-y-4">
      {/* 使用说明 */}
      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
        <h3 className="font-medium text-blue-800 mb-2">📝 可视化自定义区块编辑器</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>1. 从左侧<strong>组件库</strong>中点击添加组件</li>
          <li>2. 在中间区域<strong>点击组件</strong>进行选择</li>
          <li>3. 在右侧<strong>属性面板</strong>调整样式</li>
          <li>4. 实时预览效果，完成后点击保存</li>
        </ul>
      </div>

      <div className="flex gap-4">
        {/* 左侧组件库 */}
        <div className="w-1/4 bg-gray-50 p-4 rounded-lg">
          <h3 className="font-medium text-gray-800 mb-3">🧩 组件库</h3>
          <div className="space-y-2">
            <button
              onClick={() => addComponent('heading')}
              className="w-full p-3 text-left bg-white rounded border hover:border-blue-300 hover:shadow-sm transition-all flex items-center"
            >
              <span className="text-xl mr-2">H</span>
              <span>标题</span>
            </button>
            <button
              onClick={() => addComponent('text')}
              className="w-full p-3 text-left bg-white rounded border hover:border-blue-300 hover:shadow-sm transition-all flex items-center"
            >
              <span className="text-xl mr-2">📝</span>
              <span>文本</span>
            </button>
            <button
              onClick={() => addComponent('image')}
              className="w-full p-3 text-left bg-white rounded border hover:border-blue-300 hover:shadow-sm transition-all flex items-center"
            >
              <span className="text-xl mr-2">🖼️</span>
              <span>图片</span>
            </button>
            <button
              onClick={() => addComponent('button')}
              className="w-full p-3 text-left bg-white rounded border hover:border-blue-300 hover:shadow-sm transition-all flex items-center"
            >
              <span className="text-xl mr-2">🔘</span>
              <span>按钮</span>
            </button>
            <button
              onClick={() => addComponent('container')}
              className="w-full p-3 text-left bg-white rounded border hover:border-blue-300 hover:shadow-sm transition-all flex items-center"
            >
              <span className="text-xl mr-2">📦</span>
              <span>容器</span>
            </button>
          </div>
        </div>

        {/* 中间预览区域 */}
        <div className="flex-1">
          <div className="p-4 border rounded-lg bg-gray-50 h-full">
            <h3 className="font-medium text-gray-800 mb-3">👁️ 实时预览</h3>
            <div className="bg-white p-4 rounded border min-h-[400px]">
              {components.length > 0 ? (
                <div>
                  <style>{generateOutput().css}</style>
                  {components.map(comp => (
                    <div
                      key={comp.id}
                      onClick={() => setSelectedComponent(comp.id)}
                      className={`p-2 mb-2 cursor-pointer rounded ${
                        selectedComponent === comp.id
                          ? 'ring-2 ring-blue-500 bg-blue-50'
                          : 'hover:bg-gray-100'
                      }`}
                    >
                      {renderComponentPreview(comp)}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-gray-500 text-center py-12">
                  <div className="text-4xl mb-2">➕</div>
                  <p>从左侧组件库添加组件开始</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 右侧属性面板 */}
        <div className="w-1/3 bg-gray-50 p-4 rounded-lg">
          <h3 className="font-medium text-gray-800 mb-3">⚙️ 属性设置</h3>
          {selectedComp ? (
            <div className="space-y-4">
              <div className="bg-white p-3 rounded border">
                <h4 className="font-medium text-gray-800 mb-2">
                  {getComponentDisplayName(selectedComp.type)}
                </h4>
                {renderPropertyControls(selectedComp, updateComponentProps)}
              </div>
            </div>
          ) : (
            <div className="text-gray-500 text-center py-8">
              <p>选择一个组件来编辑属性</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// 渲染组件预览
const renderComponentPreview = (component: any) => {
  switch (component.type) {
    case 'text':
      return (
        <div style={{
          fontSize: component.props.fontSize,
          color: component.props.color,
          textAlign: component.props.textAlign
        }}>
          {component.props.content}
        </div>
      );
    case 'heading':
      const HeadingTag = component.props.level as keyof JSX.IntrinsicElements;
      return (
        <HeadingTag style={{
          fontSize: component.props.fontSize,
          color: component.props.color,
          textAlign: component.props.textAlign
        }}>
          {component.props.content}
        </HeadingTag>
      );
    case 'image':
      return (
        <img
          src={component.props.src}
          alt={component.props.alt}
          style={{
            width: component.props.width,
            height: component.props.height,
            borderRadius: component.props.borderRadius
          }}
        />
      );
    case 'button':
      return (
        <button
          style={{
            backgroundColor: component.props.backgroundColor,
            color: component.props.color,
            padding: component.props.padding,
            borderRadius: component.props.borderRadius
          }}
        >
          {component.props.text}
        </button>
      );
    case 'container':
      return (
        <div
          style={{
            padding: component.props.padding,
            backgroundColor: component.props.backgroundColor,
            borderRadius: component.props.borderRadius,
            border: '1px dashed #ccc'
          }}
        >
          容器组件
        </div>
      );
    default:
      return <div>未知组件</div>;
  }
};

// 渲染属性控制
const renderPropertyControls = (component: any, updateComponentProps: (id: number, props: any) => void) => {
  const updateProps = (newProps: any) => {
    updateComponentProps(component.id, newProps);
  };

  switch (component.type) {
    case 'text':
      return (
        <div className="space-y-3">
          <div>
            <label className="block text-sm text-gray-700 mb-1">内容</label>
            <textarea
              value={component.props.content}
              onChange={(e) => updateProps({ content: e.target.value })}
              className="w-full p-2 border rounded text-sm"
              rows={3}
            />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">字体大小</label>
            <input
              type="text"
              value={component.props.fontSize}
              onChange={(e) => updateProps({ fontSize: e.target.value })}
              className="w-full p-2 border rounded text-sm"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">文字颜色</label>
            <input
              type="color"
              value={component.props.color}
              onChange={(e) => updateProps({ color: e.target.value })}
              className="w-full p-1 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">对齐方式</label>
            <select
              value={component.props.textAlign}
              onChange={(e) => updateProps({ textAlign: e.target.value })}
              className="w-full p-2 border rounded text-sm"
            >
              <option value="left">左对齐</option>
              <option value="center">居中</option>
              <option value="right">右对齐</option>
            </select>
          </div>
        </div>
      );
    case 'heading':
      return (
        <div className="space-y-3">
          <div>
            <label className="block text-sm text-gray-700 mb-1">标题级别</label>
            <select
              value={component.props.level}
              onChange={(e) => updateProps({ level: e.target.value })}
              className="w-full p-2 border rounded text-sm"
            >
              <option value="h1">H1</option>
              <option value="h2">H2</option>
              <option value="h3">H3</option>
              <option value="h4">H4</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">内容</label>
            <input
              type="text"
              value={component.props.content}
              onChange={(e) => updateProps({ content: e.target.value })}
              className="w-full p-2 border rounded text-sm"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">字体大小</label>
            <input
              type="text"
              value={component.props.fontSize}
              onChange={(e) => updateProps({ fontSize: e.target.value })}
              className="w-full p-2 border rounded text-sm"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">文字颜色</label>
            <input
              type="color"
              value={component.props.color}
              onChange={(e) => updateProps({ color: e.target.value })}
              className="w-full p-1 border rounded"
            />
          </div>
        </div>
      );
    case 'image':
      return (
        <div className="space-y-3">
          <div>
            <label className="block text-sm text-gray-700 mb-1">图片地址</label>
            <input
              type="text"
              value={component.props.src}
              onChange={(e) => updateProps({ src: e.target.value })}
              className="w-full p-2 border rounded text-sm"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">替代文本</label>
            <input
              type="text"
              value={component.props.alt}
              onChange={(e) => updateProps({ alt: e.target.value })}
              className="w-full p-2 border rounded text-sm"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">宽度</label>
            <input
              type="text"
              value={component.props.width}
              onChange={(e) => updateProps({ width: e.target.value })}
              className="w-full p-2 border rounded text-sm"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">圆角</label>
            <input
              type="text"
              value={component.props.borderRadius}
              onChange={(e) => updateProps({ borderRadius: e.target.value })}
              className="w-full p-2 border rounded text-sm"
            />
          </div>
        </div>
      );
    case 'button':
      return (
        <div className="space-y-3">
          <div>
            <label className="block text-sm text-gray-700 mb-1">按钮文字</label>
            <input
              type="text"
              value={component.props.text}
              onChange={(e) => updateProps({ text: e.target.value })}
              className="w-full p-2 border rounded text-sm"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">背景颜色</label>
            <input
              type="color"
              value={component.props.backgroundColor}
              onChange={(e) => updateProps({ backgroundColor: e.target.value })}
              className="w-full p-1 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">文字颜色</label>
            <input
              type="color"
              value={component.props.color}
              onChange={(e) => updateProps({ color: e.target.value })}
              className="w-full p-1 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">内边距</label>
            <input
              type="text"
              value={component.props.padding}
              onChange={(e) => updateProps({ padding: e.target.value })}
              className="w-full p-2 border rounded text-sm"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">圆角</label>
            <input
              type="text"
              value={component.props.borderRadius}
              onChange={(e) => updateProps({ borderRadius: e.target.value })}
              className="w-full p-2 border rounded text-sm"
            />
          </div>
        </div>
      );
    case 'container':
      return (
        <div className="space-y-3">
          <div>
            <label className="block text-sm text-gray-700 mb-1">内边距</label>
            <input
              type="text"
              value={component.props.padding}
              onChange={(e) => updateProps({ padding: e.target.value })}
              className="w-full p-2 border rounded text-sm"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">背景颜色</label>
            <input
              type="color"
              value={component.props.backgroundColor}
              onChange={(e) => updateProps({ backgroundColor: e.target.value })}
              className="w-full p-1 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">圆角</label>
            <input
              type="text"
              value={component.props.borderRadius}
              onChange={(e) => updateProps({ borderRadius: e.target.value })}
              className="w-full p-2 border rounded text-sm"
            />
          </div>
        </div>
      );
    default:
      return (
        <div className="text-gray-500">
          <p>选择组件以编辑属性</p>
        </div>
      );
  }
};

// 获取组件显示名称
const getComponentDisplayName = (type: string) => {
  switch (type) {
    case 'text': return '文本组件';
    case 'heading': return '标题组件';
    case 'image': return '图片组件';
    case 'button': return '按钮组件';
    case 'container': return '容器组件';
    default: return '未知组件';
  }
};

export default CustomBlockEditor;