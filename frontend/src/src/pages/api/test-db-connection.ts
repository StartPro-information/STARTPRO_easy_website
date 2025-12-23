import { NextApiRequest, NextApiResponse } from 'next';

// 注意：这种方法仅用于测试目的
// 在生产环境中，你应该使用更安全的数据库连接方式

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // 这里应该导入你的实际数据库连接
    // 由于这是前端项目，我们需要通过API调用后端

    // 如果你想直接从前端测试后端数据库连接，
    // 最好的方法是调用后端的健康检查端点

    const response = await fetch('http://localhost:3003/api/health');

    if (response.ok) {
      const data = await response.json();
      res.status(200).json({
        success: true,
        message: '数据库连接测试成功',
        backendHealth: data
      });
    } else {
      res.status(500).json({
        success: false,
        message: '后端服务不可用',
        status: response.status
      });
    }
  } catch (error) {
    console.error('数据库连接测试失败:', error);
    res.status(500).json({
      success: false,
      message: '数据库连接测试失败',
      error: error instanceof Error ? error.message : '未知错误'
    });
  }
}