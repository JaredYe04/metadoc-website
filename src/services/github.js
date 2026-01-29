const GITHUB_API_BASE = 'https://api.github.com/repos/JaredYe04/MetaDoc-Releases'
const RELEASES_PAGE_URL = 'https://github.com/JaredYe04/MetaDoc-Releases/releases'

// 超时辅助函数
function timeoutPromise(ms) {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error('Request timeout')), ms)
  })
}

// 从 assets 中按平台分类下载链接（使用实际发布日期 published_at）
function pickAssetsByPlatform(assets) {
  const windows = assets?.find(a =>
    (a.name && (a.name.endsWith('.exe') || a.name.includes('windows'))))
  const mac = assets?.find(a =>
    (a.name && (a.name.endsWith('.dmg') || (a.name.endsWith('.zip') && (a.name.includes('mac') || a.name.includes('arm64'))))))
  const linuxAppImage = assets?.find(a => (a.name && a.name.endsWith('.AppImage')))
  const linuxDeb = assets?.find(a => (a.name && a.name.endsWith('.deb')))
  const linuxSnap = assets?.find(a => (a.name && a.name.endsWith('.snap')))
  const linux = linuxAppImage || linuxDeb || linuxSnap
  return {
    windows: windows?.browser_download_url || null,
    mac: mac?.browser_download_url || null,
    linux: linux?.browser_download_url || null
  }
}

/**
 * 获取“最新”发布信息。MetaDoc-Releases 可能只有 prerelease，/releases/latest 会 404，
 * 因此优先用 /releases 列表取第一条（按发布时间排序），保证有正确的 published_at 和多平台链接。
 */
export async function getLatestRelease() {
  try {
    // 1) 先请求 /releases 列表（支持仅有 prerelease 的仓库，且返回真实 published_at）
    const listPromise = fetch(`${GITHUB_API_BASE}/releases?per_page=5`, {
      headers: { 'Accept': 'application/vnd.github.v3+json' }
    })
    const listResponse = await Promise.race([listPromise, timeoutPromise(12000)])
    if (listResponse.ok) {
      const list = await listResponse.json()
      if (list && list.length > 0) {
        const release = list[0]
        const publishedAt = release.published_at || release.created_at
        const urls = pickAssetsByPlatform(release.assets || [])
        const windowsUrl = urls.windows || (release.assets?.[0]?.browser_download_url) || `${RELEASES_PAGE_URL}/tag/${release.tag_name}`
        return {
          version: release.tag_name,
          name: release.name || release.tag_name,
          publishedAt: publishedAt || new Date().toISOString(),
          downloadUrl: windowsUrl,
          assets: release.assets || [],
          htmlUrl: release.html_url || `${RELEASES_PAGE_URL}/tag/${release.tag_name}`,
          downloadByPlatform: urls
        }
      }
    }

    // 2) 若列表为空，尝试 /releases/latest（正式版仓库会有 latest）
    const latestPromise = fetch(`${GITHUB_API_BASE}/releases/latest`, {
      headers: { 'Accept': 'application/vnd.github.v3+json' }
    })
    const latestResponse = await Promise.race([latestPromise, timeoutPromise(8000)])
    if (latestResponse.ok) {
      const data = await latestResponse.json()
      const publishedAt = data.published_at || data.created_at
      const urls = pickAssetsByPlatform(data.assets || [])
      const windowsUrl = urls.windows || data.assets?.[0]?.browser_download_url || data.html_url
      return {
        version: data.tag_name,
        name: data.name || data.tag_name,
        publishedAt: publishedAt || new Date().toISOString(),
        downloadUrl: windowsUrl,
        assets: data.assets || [],
        htmlUrl: data.html_url,
        downloadByPlatform: urls
      }
    }

    // 3) 最后回退到 tags，但不再用“当天日期”，只提供链接
    const tagsPromise = fetch(`${GITHUB_API_BASE}/tags?per_page=5`, {
      headers: { 'Accept': 'application/vnd.github.v3+json' }
    })
    const tagsResponse = await Promise.race([tagsPromise, timeoutPromise(5000)])
    if (tagsResponse.ok) {
      const tags = await tagsResponse.json()
      if (tags.length > 0) {
        const tag = tags[0]
        return {
          version: tag.name,
          name: tag.name,
          publishedAt: null,
          downloadUrl: `${RELEASES_PAGE_URL}/tag/${tag.name}`,
          assets: [],
          htmlUrl: `${RELEASES_PAGE_URL}/tag/${tag.name}`,
          downloadByPlatform: { windows: null, mac: null, linux: null }
        }
      }
    }

    throw new Error('No release or tag found')
  } catch (error) {
    console.error('Error fetching latest release:', error)
    return {
      version: 'v0.0.0',
      name: 'Latest Release',
      publishedAt: null,
      downloadUrl: RELEASES_PAGE_URL,
      assets: [],
      htmlUrl: RELEASES_PAGE_URL,
      downloadByPlatform: { windows: null, mac: null, linux: null }
    }
  }
}

export async function getAllReleases() {
  try {
    const response = await Promise.race([
      fetch(`${GITHUB_API_BASE}/releases?per_page=10`, {
        headers: { 'Accept': 'application/vnd.github.v3+json' }
      }),
      timeoutPromise(12000)
    ])
    if (!response.ok) {
      throw new Error('Failed to fetch releases')
    }
    return await response.json()
  } catch (error) {
    console.error('Error fetching releases:', error)
    throw error
  }
}

