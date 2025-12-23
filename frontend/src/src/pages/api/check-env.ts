// 检查环境变量的API路由
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // 仅在开发环境中显示敏感信息
  if (process.env.NODE_ENV !== 'development') {
    return res.status(403).json({
      success: false,
      message: '此端点仅在开发环境中可用'
    });
  }

  // 获取环境变量信息（隐藏敏感信息）
  const envInfo = {
    DB_HOST: process.env.DB_HOST || '未设置',
    DB_PORT: process.env.DB_PORT || '未设置',
    DB_NAME: process.env.DB_NAME || '未设置',
    DB_USER: process.env.DB_USER ? '已设置' : '未设置', // 不显示实际用户名
    NODE_ENV: process.env.NODE_ENV || '未设置'
  };

  res.status(200).json({
    success: true,
    message: '环境变量检查完成',
    envInfo
  });
}