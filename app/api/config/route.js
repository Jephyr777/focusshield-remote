import { NextResponse } from 'next/server';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_REPO = process.env.GITHUB_REPO; // 格式: "owner/repo"
const GITHUB_PATH = process.env.GITHUB_PATH || 'config.json';
const GITHUB_BRANCH = process.env.GITHUB_BRANCH || 'main';

export async function GET() {
  if (!GITHUB_TOKEN || !GITHUB_REPO) {
    return NextResponse.json(
      { error: 'Server is not configured: GITHUB_TOKEN or GITHUB_REPO is missing' },
      { status: 500 }
    );
  }

  try {
    const url = `https://api.github.com/repos/${GITHUB_REPO}/contents/${GITHUB_PATH}?ref=${GITHUB_BRANCH}`;
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        Accept: 'application/vnd.github.v3+json',
        'Cache-Control': 'no-cache', // 严禁 Vercel 缓存，每次都获取最新提交！
      },
    });

    if (res.status === 404) {
      // 默认配置
      return NextResponse.json({
        blocked: false,
        message: "",
        supervisor: "小王",
        updated_at: new Date().toISOString()
      });
    }

    if (!res.ok) {
      throw new Error(`GitHub API returned status ${res.status}`);
    }

    const data = await res.json();
    const content = Buffer.from(data.content, 'base64').toString('utf-8');
    const config = JSON.parse(content);
    return NextResponse.json(config);
  } catch (err) {
    console.error('Error fetching config from GitHub:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  if (!GITHUB_TOKEN || !GITHUB_REPO) {
    return NextResponse.json(
      { error: 'Server is not configured: GITHUB_TOKEN or GITHUB_REPO is missing' },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();
    const { blocked, message, supervisor } = body;

    // 1. 获取现有文件的 sha
    const url = `https://api.github.com/repos/${GITHUB_REPO}/contents/${GITHUB_PATH}?ref=${GITHUB_BRANCH}`;
    const getRes = await fetch(url, {
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        Accept: 'application/vnd.github.v3+json',
        'Cache-Control': 'no-cache',
      },
    });

    let sha = null;
    if (getRes.ok) {
      const getData = await getRes.json();
      sha = getData.sha;
    }

    // 2. 构造最新的 config.json
    const newConfig = {
      blocked: !!blocked,
      message: message || "",
      supervisor: supervisor || "小王",
      updated_at: new Date().toISOString()
    };

    const newContentBase64 = Buffer.from(JSON.stringify(newConfig, null, 4), 'utf-8').toString('base64');

    // 3. PUT 写入新内容并自动创建 commit
    const putBody = {
      message: `Update FocusShield status: ${blocked ? 'LOCK' : 'UNLOCK'} by ${newConfig.supervisor}`,
      content: newContentBase64,
      branch: GITHUB_BRANCH,
    };
    if (sha) {
      putBody.sha = sha;
    }

    const putRes = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/${GITHUB_PATH}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        Accept: 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(putBody),
    });

    if (!putRes.ok) {
      const errorText = await putRes.text();
      throw new Error(`GitHub update failed: ${errorText}`);
    }

    return NextResponse.json({ success: true, config: newConfig });
  } catch (err) {
    console.error('Error updating config on GitHub:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
