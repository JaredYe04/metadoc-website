const GITHUB_API_BASE = 'https://api.github.com/repos/JaredYe04/MetaDoc-Releases'

// 超时辅助函数
function timeoutPromise(ms) {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error('Request timeout')), ms)
  })
}

export async function getLatestRelease() {
  try {
    // 使用 Promise.race 实现超时
    const fetchPromise = fetch(`${GITHUB_API_BASE}/releases/latest`, {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
      },
    })
    
    const response = await Promise.race([
      fetchPromise,
      timeoutPromise(10000) // 10秒超时
    ])
    
    if (!response.ok) {
      // 如果请求失败，尝试使用 tags API
      try {
        const tagsFetchPromise = fetch(`${GITHUB_API_BASE}/tags`, {
          headers: {
            'Accept': 'application/vnd.github.v3+json',
          },
        })
        
        const tagsResponse = await Promise.race([
          tagsFetchPromise,
          timeoutPromise(5000) // 5秒超时
        ])
        
        if (tagsResponse.ok) {
          const tags = await tagsResponse.json()
          if (tags.length > 0) {
            return {
              version: tags[0].name,
              name: tags[0].name,
              publishedAt: new Date().toISOString(),
              downloadUrl: `https://github.com/JaredYe04/MetaDoc-Releases/releases/tag/${tags[0].name}`,
              assets: [],
              htmlUrl: `https://github.com/JaredYe04/MetaDoc-Releases/releases/tag/${tags[0].name}`
            }
          }
        }
      } catch (tagsError) {
        console.warn('Failed to fetch tags:', tagsError)
      }
      throw new Error(`Failed to fetch latest release: ${response.status} ${response.statusText}`)
    }
    
    const data = await response.json()
    
    // 查找Windows安装包
    const windowsAsset = data.assets?.find(asset => 
      asset.name.includes('.exe') || asset.name.includes('windows')
    )
    
    return {
      version: data.tag_name,
      name: data.name || data.tag_name,
      publishedAt: data.published_at,
      downloadUrl: windowsAsset?.browser_download_url || data.assets?.[0]?.browser_download_url || data.html_url,
      assets: data.assets || [],
      htmlUrl: data.html_url
    }
  } catch (error) {
    console.error('Error fetching latest release:', error)
    // 返回一个默认值而不是抛出错误
    return {
      version: 'v0.0.0',
      name: 'Latest Release',
      publishedAt: new Date().toISOString(),
      downloadUrl: 'https://github.com/JaredYe04/MetaDoc-Releases/releases',
      assets: [],
      htmlUrl: 'https://github.com/JaredYe04/MetaDoc-Releases/releases'
    }
  }
}

export async function getAllReleases() {
  try {
    const response = await fetch(`${GITHUB_API_BASE}/releases?per_page=10`)
    if (!response.ok) {
      throw new Error('Failed to fetch releases')
    }
    return await response.json()
  } catch (error) {
    console.error('Error fetching releases:', error)
    throw error
  }
}

