/**
 * 官网用户反馈：使用 VITE_GITHUB_FEEDBACK_TOKEN / VITE_GITHUB_FEEDBACK_GIST_TOKEN
 * 在构建时从仓库 Secrets 注入（deploy 工作流中配置）。
 */

const WORKFLOW_INPUT_MAX = 1024
const GITHUB_API = 'https://api.github.com'

async function createGist(token, files, description) {
  const res = await fetch(`${GITHUB_API}/gists`, {
    method: 'POST',
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'MetaDoc-Website-Feedback/1.0',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ description, public: false, files })
  })
  if (res.status !== 201) {
    const text = await res.text()
    throw new Error(`Gist API ${res.status}: ${text || res.statusText}`)
  }
  const json = await res.json()
  const first = json.files && Object.values(json.files)[0]
  const rawUrl = first?.raw_url || ''
  return rawUrl
}

function escapeHtml(s) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function buildAttachmentHtml(filename, mime, contentBase64) {
  const isImageMime = (m) => /^image\//.test(m)
  const safeName = escapeHtml(filename)
  const dataUrl = `data:${mime};base64,${contentBase64}`
  if (isImageMime(mime)) {
    return [
      '<!DOCTYPE html><html><head><meta charset="utf-8"><title>' + safeName + '</title>',
      '<meta name="viewport" content="width=device-width,initial-scale=1">',
      '</head><body style="margin:0;background:#1e1e1e;min-height:100vh;display:flex;align-items:center;justify-content:center;">',
      '<img src="' + dataUrl + '" style="max-width:100%;max-height:100vh;object-fit:contain;" alt="' + safeName + '"/>',
      '</body></html>'
    ].join('')
  }
  const downloadAttr = filename.replace(/"/g, '&quot;').replace(/'/g, '&#39;')
  return [
    '<!DOCTYPE html><html><head><meta charset="utf-8"><title>' + safeName + '</title>',
    '</head><body style="font-family:sans-serif;padding:1rem;">',
    '<p><a href="' + dataUrl + '" download="' + downloadAttr + '" style="font-size:1.1rem;">下载 ' + safeName + '</a></p>',
    '<p style="color:#666;font-size:0.9rem;">若未自动下载，请右键链接选择“另存为”。</p>',
    '</body></html>'
  ].join('')
}

/**
 * 提交反馈：上传正文与附件到 Gist，再触发 workflow_dispatch。
 * @param {Object} payload - { title, type, body, attachments: JSON string }
 * @param {Function} onAttachmentUploaded - (index: number) => void，每上传一个附件后调用
 * @returns {Promise<void>}
 */
export async function submitFeedback(payload, onAttachmentUploaded) {
  const token = import.meta.env.VITE_GITHUB_FEEDBACK_TOKEN
  const gistToken = import.meta.env.VITE_GITHUB_FEEDBACK_GIST_TOKEN
  const owner = import.meta.env.VITE_GITHUB_FEEDBACK_REPO_OWNER || 'JaredYe04'
  const repo = import.meta.env.VITE_GITHUB_FEEDBACK_REPO || 'MetaDoc'

  if (!token || !gistToken) {
    throw new Error('VITE_GITHUB_FEEDBACK_TOKEN / VITE_GITHUB_FEEDBACK_GIST_TOKEN not set. Configure repo Secrets and rebuild.')
  }

  const title = String(payload.title).slice(0, WORKFLOW_INPUT_MAX)
  const type = payload.type || 'other'

  const bodyUrl = await createGist(
    gistToken,
    { 'feedback-body.md': { content: payload.body } },
    'MetaDoc feedback body'
  )
  const bodyUrlTrim = bodyUrl.slice(0, WORKFLOW_INPUT_MAX)

  const attachmentUrls = []
  const isImageMime = (m) => /^image\//.test(m)
  const isTextMime = (m) => /^text\//.test(m) || m === 'application/json' || m === 'application/xml'
  let attachments = []
  try {
    attachments = JSON.parse(payload.attachments || '[]')
  } catch (_) {}

  function base64ToUtf8(base64) {
    const bin = atob(base64)
    const bytes = new Uint8Array([...bin].map((c) => c.charCodeAt(0)))
    return new TextDecoder().decode(bytes)
  }
  for (let i = 0; i < Math.min(5, attachments.length); i++) {
    const att = attachments[i]
    const content = isImageMime(att.mime) || !isTextMime(att.mime)
      ? buildAttachmentHtml(att.filename, att.mime, att.content_base64)
      : base64ToUtf8(att.content_base64)
    const gistFilename = isImageMime(att.mime) || !isTextMime(att.mime) ? 'view.html' : att.filename
    const rawUrl = await createGist(
      gistToken,
      { [gistFilename]: { content } },
      `MetaDoc feedback attachment: ${att.filename}`
    )
    const displayUrl = rawUrl.replace('https://gist.githubusercontent.com/', 'https://gist.githack.com/')
    attachmentUrls.push(displayUrl.slice(0, WORKFLOW_INPUT_MAX))
    if (onAttachmentUploaded) onAttachmentUploaded(i)
  }

  const workflowId = 'user-feedback.yml'
  const url = `${GITHUB_API}/repos/${owner}/${repo}/actions/workflows/${workflowId}/dispatches`
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'MetaDoc-Website-Feedback/1.0',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      ref: 'main',
      inputs: {
        title,
        type,
        body_url: bodyUrlTrim,
        attachment_url_1: attachmentUrls[0] || '',
        attachment_url_2: attachmentUrls[1] || '',
        attachment_url_3: attachmentUrls[2] || '',
        attachment_url_4: attachmentUrls[3] || '',
        attachment_url_5: attachmentUrls[4] || ''
      }
    })
  })

  if (res.status !== 204) {
    const text = await res.text()
    throw new Error(`Workflow dispatch ${res.status}: ${text || res.statusText}`)
  }
}

export function isFeedbackConfigured() {
  return !!(
    import.meta.env.VITE_GITHUB_FEEDBACK_TOKEN &&
    import.meta.env.VITE_GITHUB_FEEDBACK_GIST_TOKEN
  )
}
