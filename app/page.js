'use client';

import { useState, useEffect } from 'react';
import { Shield, Gamepad2, User, Clock, MessageSquare, AlertCircle } from 'lucide-react';

export default function Home() {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  
  // 表单状态
  const [supervisor, setSupervisor] = useState('小王');
  const [message, setMessage] = useState('');

  // 快捷留言
  const quickMessages = ['加油', '先学习', '408冲刺', '实验做完再玩'];

  // 获取当前状态
  const fetchConfig = async () => {
    try {
      const res = await fetch('/api/config', { cache: 'no-store' });
      if (!res.ok) throw new Error('无法连接 GitHub 服务器');
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      
      setConfig(data);
      setSupervisor(data.supervisor || '小王');
      setMessage(data.message || '');
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  // 提交更改
  const handleToggle = async () => {
    if (!config || submitting) return;
    setSubmitting(true);
    setError(null);

    const targetBlocked = !config.blocked;

    try {
      const res = await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          blocked: targetBlocked,
          message: message,
          supervisor: supervisor,
        }),
      });

      if (!res.ok) throw new Error('更新配置失败');
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setConfig(data.config);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // 格式化时间
  const formatTime = (isoString) => {
    if (!isoString) return '-';
    try {
      const date = new Date(isoString);
      return date.toLocaleString('zh-CN', {
        hour12: false,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (e) {
      return isoString;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA]">
        <div className="text-gray-400 text-sm animate-pulse">正在获取远程控制状态...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] px-4 py-12 flex flex-col items-center">
      <div className="w-full max-w-[600px] flex flex-col gap-6">
        
        {/* Header */}
        <div className="text-center md:text-left mb-2">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">FocusShield Remote</h1>
          <p className="text-sm text-gray-500 mt-1">帮助朋友保持专注，回归高效生活</p>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex gap-3 items-start text-red-800">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-sm font-semibold">同步失败</h4>
              <p className="text-xs text-red-700 mt-1">无法连接 GitHub，请检查 Vercel 环境变量配置。({error})</p>
            </div>
          </div>
        )}

        {/* Main Control Card */}
        <div className="bg-white rounded-2xl border border-gray-200/85 p-6 md:p-8 shadow-sm flex flex-col gap-6">
          
          {/* Status Display Area */}
          <div className="flex flex-col items-center py-6 border-b border-gray-100">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">当前运行模式</span>
            {config?.blocked ? (
              <div className="flex flex-col items-center gap-2">
                <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center border border-emerald-100 text-emerald-600 mb-1">
                  <Shield className="w-8 h-8 fill-emerald-500/10" />
                </div>
                <h2 className="text-3xl font-extrabold text-emerald-600 tracking-tight">🛡️ 专注守护中</h2>
                <p className="text-xs text-gray-400">客户端所有游戏进程将被强制静默终止</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center border border-gray-100 text-gray-500 mb-1">
                  <Gamepad2 className="w-8 h-8" />
                </div>
                <h2 className="text-3xl font-extrabold text-gray-600 tracking-tight">🎮 允许娱乐</h2>
                <p className="text-xs text-gray-400">受限游戏可正常运行，客户端暂停拦截</p>
              </div>
            )}
          </div>

          {/* Toggle Action Button */}
          <button
            onClick={handleToggle}
            disabled={submitting}
            className={`w-full h-14 rounded-xl font-semibold text-base transition-all duration-200 active:scale-[0.99] flex items-center justify-center shadow-sm ${
              config?.blocked
                ? 'bg-gray-100 hover:bg-gray-200 text-gray-800 border border-gray-200'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
            } disabled:opacity-60 disabled:pointer-events-none`}
          >
            {submitting ? (
              <div className="w-6 h-6 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
            ) : config?.blocked ? (
              '关闭专注模式'
            ) : (
              '开启专注模式'
            )}
          </button>

          {/* Supervisor Config */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" /> 监督者昵称
            </label>
            <input
              type="text"
              value={supervisor}
              onChange={(e) => setSupervisor(e.target.value)}
              placeholder="请输入监督者昵称，例如：小王"
              className="w-full h-11 px-3.5 rounded-xl border border-gray-200 bg-gray-50/30 text-gray-800 text-sm outline-none focus:border-gray-400 focus:bg-white transition-all"
            />
          </div>

          {/* Message Area */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5" /> 给朋友留一句话 (随按钮点击一并保存)
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              placeholder="坚持一下，你可以的！做完实验再玩..."
              className="w-full p-3.5 rounded-xl border border-gray-200 bg-gray-50/30 text-gray-800 text-sm outline-none resize-none focus:border-gray-400 focus:bg-white transition-all"
            />
            {/* Quick Messages */}
            <div className="flex flex-wrap gap-2 mt-1">
              {quickMessages.map((msgText) => (
                <button
                  key={msgText}
                  type="button"
                  onClick={() => setMessage(msgText)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 transition-colors"
                >
                  {msgText}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Footer Meta info */}
        <div className="bg-gray-100/60 rounded-xl border border-gray-200/50 p-4 flex flex-col sm:flex-row sm:justify-between gap-3 text-xs text-gray-400">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-gray-300" /> 最后修改时间：{formatTime(config?.updated_at)}
          </span>
          <span className="flex items-center gap-1">
            <User className="w-3.5 h-3.5 text-gray-300" /> 最后操作人：{config?.supervisor || '-'}
          </span>
        </div>

      </div>
    </div>
  );
}
