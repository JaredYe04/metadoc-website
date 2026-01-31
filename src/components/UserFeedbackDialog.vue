<template>
  <el-dialog
    :model-value="modelValue"
    :title="$t('userFeedback.title')"
    width="960px"
    top="2%"
    class="feedback-dialog"
    destroy-on-close
    append-to-body
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <div class="user-feedback-view">
      <div class="feedback-form-scroll">
        <el-form :model="form" label-position="top" class="feedback-form">
          <el-form-item :label="$t('userFeedback.feedbackType')" required>
            <el-select
              v-model="form.type"
              :placeholder="$t('userFeedback.selectType')"
              style="width: 100%"
              :disabled="submitting"
            >
              <el-option
                v-for="opt in feedbackTypeOptions"
                :key="opt.value"
                :label="opt.label"
                :value="opt.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item :label="$t('userFeedback.titleLabel')" required>
            <el-input
              v-model="form.title"
              :placeholder="$t('userFeedback.titlePlaceholder')"
              maxlength="200"
              show-word-limit
              :disabled="submitting"
            />
          </el-form-item>
          <el-form-item :label="$t('userFeedback.bodyLabel')" required>
            <div ref="editorContainer" class="monaco-editor-container"></div>
          </el-form-item>
          <el-form-item :label="$t('userFeedback.attachments')">
            <div class="attachments-area">
              <el-upload
                ref="uploadRef"
                :auto-upload="false"
                :limit="5"
                multiple
                :show-file-list="false"
                :disabled="submitting || attachmentBase64List.length >= MAX_ATTACHMENTS"
                :on-change="handleFileChange"
                :on-exceed="handleExceed"
                :on-remove="handleRemove"
                :file-list="fileList"
                accept="*/*"
              >
                <el-button type="primary" plain :disabled="submitting || attachmentBase64List.length >= MAX_ATTACHMENTS">
                  {{ $t('userFeedback.addAttachment') }}
                </el-button>
              </el-upload>
              <div v-if="attachmentBase64List.length > 0" class="attachment-list">
                <div
                  v-for="(att, index) in attachmentBase64List"
                  :key="att.filename + index"
                  class="attachment-item"
                  :class="{ 'attachment-image': isImageMime(att.mime) }"
                  @click="isImageMime(att.mime) ? openImagePreview(att) : null"
                >
                  <img
                    v-if="isImageMime(att.mime)"
                    :src="'data:' + att.mime + ';base64,' + att.content_base64"
                    class="attachment-thumb"
                    :alt="att.filename"
                  />
                  <span v-else class="attachment-name">{{ att.filename }}</span>
                  <el-icon v-if="uploadedAttachmentIndices.includes(index)" class="attachment-uploaded-check" title="已上传到 Gist">
                    <Check />
                  </el-icon>
                  <el-icon v-if="isImageMime(att.mime)" class="attachment-preview-hint"><View /></el-icon>
                  <el-icon
                    v-show="!submitting"
                    class="attachment-remove"
                    @click.stop="removeAttachment(att.filename)"
                  >
                    <CircleClose />
                  </el-icon>
                </div>
              </div>
              <div class="attachment-hint">{{ $t('userFeedback.attachmentRules') }}</div>
              <div v-if="attachmentsError" class="attachment-error">{{ attachmentsError }}</div>
            </div>
          </el-form-item>
          <div class="feedback-footer">
            <div class="footer-hint">{{ $t('userFeedback.footerHint') }}</div>
            <div class="footer-contact">
              {{ $t('userFeedback.emailHint') }}
              <span class="footer-copy" @click="copyToClipboard('1010268129@outlook.com')">1010268129@outlook.com</span>
            </div>
            <div class="footer-contact">
              {{ $t('userFeedback.qqGroupHint') }}
              <span class="footer-copy" @click="copyToClipboard('1079841705')">1079841705</span>
            </div>
          </div>
        </el-form>
      </div>
      <div class="feedback-submit-bar">
        <el-button
          type="primary"
          :loading="submitting"
          :disabled="!canSubmit"
          @click="handleSubmit"
        >
          {{ submitting ? $t('userFeedback.submitting') : $t('userFeedback.submit') }}
        </el-button>
      </div>
    </div>
    <!-- 图片预览 -->
    <el-dialog
      v-model="showImagePreview"
      :show-close="true"
      width="auto"
      class="image-preview-dialog"
      append-to-body
      @close="showImagePreview = false"
    >
      <img v-if="previewImageUrl" :src="previewImageUrl" style="max-width: 90vw; max-height: 85vh; display: block;" alt="Preview" />
    </el-dialog>
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'
import { View, CircleClose, Check } from '@element-plus/icons-vue'
import * as monaco from 'monaco-editor'
import { useDark } from '@vueuse/core'
import { submitFeedback, isFeedbackConfigured } from '../services/feedback'

const props = defineProps({ modelValue: Boolean })
const emit = defineEmits(['update:modelValue'])

const SINGLE_FILE_MAX_BYTES = 10 * 1024 * 1024
const TOTAL_ATTACHMENTS_MAX_BYTES = 50 * 1024 * 1024
const MAX_ATTACHMENTS = 5
const SINGLE_FILE_MAX_LABEL = '10 MB'
const TOTAL_MAX_LABEL = '50 MB'

const { t } = useI18n()
const isDark = useDark({ storageKey: 'theme', valueDark: 'dark', valueLight: '' })

const form = ref({ type: 'bug', title: '', body: '' })
const editorContainer = ref(null)
let editor = null
const submitting = ref(false)
const fileList = ref([])
const attachmentBase64List = ref([])
const attachmentsError = ref('')
const bodyFromEditor = ref('')
const showImagePreview = ref(false)
const previewImageUrl = ref('')
const uploadedAttachmentIndices = ref([])

const feedbackTypeOptions = computed(() => [
  { value: 'bug', label: t('userFeedback.types.bug') },
  { value: 'feature', label: t('userFeedback.types.feature') },
  { value: 'security', label: t('userFeedback.types.security') },
  { value: 'other', label: t('userFeedback.types.other') }
])

function getAppVersion() {
  return Promise.resolve('Website')
}

function getSystemInfoBlock() {
  const os = navigator.platform || 'Unknown'
  const cpu = navigator.hardwareConcurrency ? `${navigator.hardwareConcurrency} cores` : 'Unknown'
  const ram = 'N/A'
  const gpu = 'N/A'
  const version = 'MetaDoc Version'
  return [
    `### ${t('userFeedback.template.systemInfo')}`,
    `- OS: ${os}`,
    `- CPU: ${cpu}`,
    `- GPU: ${gpu}`,
    `- RAM: ${ram}`,
    `- ${version}: `
  ].join('\n')
}

async function buildBodyTemplate() {
  const sysBlock = getSystemInfoBlock()
  const metaVersion = await getAppVersion()
  const sysBlockWithVersion = sysBlock + metaVersion + '\n\n'
  const desc = t('userFeedback.template.describeProblem')
  const expected = t('userFeedback.template.expectedResult')
  const other = t('userFeedback.template.otherInfo')
  const contact = t('userFeedback.template.contactOptional')
  return (
    sysBlockWithVersion +
    `### ${t('userFeedback.template.describeProblemTitle')}\n\n<!-- ${desc} -->\n\n` +
    `### ${t('userFeedback.template.expectedResultTitle')}\n\n<!-- ${expected} -->\n\n` +
    `### ${t('userFeedback.template.otherInfoTitle')}\n\n<!-- ${other} -->\n\n` +
    `### ${t('userFeedback.template.contactTitle')}\n\n<!-- ${contact} -->`
  )
}

async function injectSystemInfo() {
  const os = navigator.platform || 'Unknown'
  const cpu = navigator.hardwareConcurrency ? `${navigator.hardwareConcurrency} cores` : 'Unknown'
  const ram = 'N/A'
  const gpu = 'N/A'
  const version = await getAppVersion()
  const model = editor?.getModel()
  if (model) {
    const full = model.getValue()
    const head = '### ' + t('userFeedback.template.systemInfo')
    const idx = full.indexOf(head)
    if (idx !== -1) {
      const endOfLine = full.indexOf('\n', idx)
      const afterHead = full.slice(endOfLine + 1)
      const nextH3 = afterHead.indexOf('\n### ')
      const systemPart = nextH3 === -1 ? afterHead : afterHead.slice(0, nextH3)
      const rest = nextH3 === -1 ? '' : afterHead.slice(nextH3)
      const newSystem = [
        head,
        `- OS: ${os}`,
        `- CPU: ${cpu}`,
        `- GPU: ${gpu}`,
        `- RAM: ${ram}`,
        `- MetaDoc Version: ${version}`
      ].join('\n')
      const before = full.slice(0, idx)
      const newFull = before + newSystem + (rest ? '\n' + rest : '')
      editor?.setValue(newFull)
      return
    }
  }
  const sysBlock = [
    '### ' + t('userFeedback.template.systemInfo'),
    `- OS: ${os}`,
    `- CPU: ${cpu}`,
    `- GPU: ${gpu}`,
    `- RAM: ${ram}`,
    `- MetaDoc Version: ${version}`
  ].join('\n') + '\n\n'
  const tail = [
    `### ${t('userFeedback.template.describeProblemTitle')}\n\n<!-- ${t('userFeedback.template.describeProblem')} -->\n\n`,
    `### ${t('userFeedback.template.expectedResultTitle')}\n\n<!-- ${t('userFeedback.template.expectedResult')} -->\n\n`,
    `### ${t('userFeedback.template.otherInfoTitle')}\n\n<!-- ${t('userFeedback.template.otherInfo')} -->\n\n`,
    `### ${t('userFeedback.template.contactTitle')}\n\n<!-- ${t('userFeedback.template.contactOptional')} -->`
  ].join('')
  if (editor) editor.setValue(sysBlock + tail)
}

function totalAttachmentBytes() {
  return attachmentBase64List.value.reduce((sum, a) => {
    try {
      const bin = atob(a.content_base64)
      return sum + bin.length
    } catch {
      return sum
    }
  }, 0)
}

function validateAttachments() {
  attachmentsError.value = ''
  if (attachmentBase64List.value.length > MAX_ATTACHMENTS) {
    attachmentsError.value = t('userFeedback.errors.tooManyFiles', { max: MAX_ATTACHMENTS })
    return false
  }
  for (const a of attachmentBase64List.value) {
    try {
      const bin = atob(a.content_base64)
      if (bin.length > SINGLE_FILE_MAX_BYTES) {
        attachmentsError.value = t('userFeedback.errors.singleFileTooLarge', { max: SINGLE_FILE_MAX_LABEL })
        return false
      }
    } catch {
      attachmentsError.value = t('userFeedback.errors.invalidFile')
      return false
    }
  }
  const total = totalAttachmentBytes()
  if (total > TOTAL_ATTACHMENTS_MAX_BYTES) {
    attachmentsError.value = t('userFeedback.errors.totalTooLarge', { max: TOTAL_MAX_LABEL })
    return false
  }
  return true
}

function readFileAsBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const dataUrl = reader.result
      const base64 = dataUrl.replace(/^data:[^;]+;base64,/, '')
      resolve(base64)
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

function getMime(filename) {
  const ext = filename.split('.').pop()?.toLowerCase() ?? ''
  const map = {
    png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', gif: 'image/gif', webp: 'image/webp',
    pdf: 'application/pdf', txt: 'text/plain', md: 'text/markdown', log: 'text/plain'
  }
  return map[ext] || 'application/octet-stream'
}

async function handleFileChange(uploadFile) {
  const raw = uploadFile.raw
  if (!raw) return
  if (raw.size > SINGLE_FILE_MAX_BYTES) {
    ElMessage.warning(t('userFeedback.errors.singleFileTooLarge', { max: SINGLE_FILE_MAX_LABEL }))
    fileList.value = fileList.value.filter(f => f.uid !== uploadFile.uid)
    return
  }
  const base64 = await readFileAsBase64(raw)
  const existing = attachmentBase64List.value.findIndex(a => a.filename === raw.name)
  if (existing >= 0) {
    attachmentBase64List.value[existing] = { filename: raw.name, mime: getMime(raw.name), content_base64: base64 }
  } else {
    attachmentBase64List.value.push({ filename: raw.name, mime: getMime(raw.name), content_base64: base64 })
  }
  const total = totalAttachmentBytes()
  if (total > TOTAL_ATTACHMENTS_MAX_BYTES) {
    attachmentsError.value = t('userFeedback.errors.totalTooLarge', { max: TOTAL_MAX_LABEL })
  } else {
    attachmentsError.value = ''
  }
  if (attachmentBase64List.value.length > MAX_ATTACHMENTS) {
    fileList.value = fileList.value.slice(0, MAX_ATTACHMENTS)
    attachmentBase64List.value = attachmentBase64List.value.slice(0, MAX_ATTACHMENTS)
    attachmentsError.value = t('userFeedback.errors.tooManyFiles', { max: MAX_ATTACHMENTS })
  }
}

function handleExceed() {
  ElMessage.warning(t('userFeedback.errors.tooManyFiles', { max: MAX_ATTACHMENTS }))
}

function handleRemove(uploadFile) {
  removeAttachment(uploadFile.name)
}

function removeAttachment(filename) {
  fileList.value = fileList.value.filter(f => f.name !== filename)
  attachmentBase64List.value = attachmentBase64List.value.filter(a => a.filename !== filename)
  attachmentsError.value = ''
}

function isImageMime(mime) {
  return /^image\//.test(mime)
}

function openImagePreview(att) {
  previewImageUrl.value = `data:${att.mime};base64,${att.content_base64}`
  showImagePreview.value = true
}

async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text)
    ElMessage.success(t('userFeedback.copied'))
  } catch {
    ElMessage.error(t('userFeedback.copyFailed'))
  }
}

const canSubmit = computed(() => {
  const body = bodyFromEditor.value.trim()
  return !!form.value.title.trim() && !!body && !attachmentsError.value
})

async function handleSubmit() {
  if (!editor) return
  const body = editor.getValue()
  form.value.body = body
  if (!form.value.title.trim()) {
    ElMessage.warning(t('userFeedback.errors.titleRequired'))
    return
  }
  if (!body.trim()) {
    ElMessage.warning(t('userFeedback.errors.bodyRequired'))
    return
  }
  if (!validateAttachments()) return
  if (!isFeedbackConfigured()) {
    ElMessage.error(t('userFeedback.errors.noIpc'))
    return
  }
  submitting.value = true
  uploadedAttachmentIndices.value = []
  try {
    await submitFeedback(
      {
        title: form.value.title.trim(),
        type: form.value.type,
        body,
        attachments: JSON.stringify(attachmentBase64List.value)
      },
      (index) => {
        uploadedAttachmentIndices.value = [...uploadedAttachmentIndices.value, index]
      }
    )
    ElMessage.success(t('userFeedback.submitSuccess'))
    form.value.title = ''
    form.value.body = ''
    const template = await buildBodyTemplate()
    editor.setValue(template)
    await injectSystemInfo()
    fileList.value = []
    attachmentBase64List.value = []
    if (uploadRef.value?.clearFiles) uploadRef.value.clearFiles()
  } catch (err) {
    const msg = err?.message || String(err)
    ElMessage.error(t('userFeedback.submitFailed') + ': ' + msg)
  } finally {
    submitting.value = false
  }
}

const uploadRef = ref(null)

watch(() => props.modelValue, async (visible) => {
  if (!visible) {
    if (editor) {
      editor.dispose()
      editor = null
    }
    return
  }
  await nextTick()
  const el = editorContainer.value
  if (!el || editor) return
  const template = await buildBodyTemplate()
  editor = monaco.editor.create(el, {
    value: template,
    language: 'markdown',
    theme: isDark.value ? 'vs-dark' : 'vs',
    automaticLayout: true,
    minimap: { enabled: true },
    scrollBeyondLastLine: false,
    fontSize: 14,
    lineNumbers: 'on',
    wordWrap: 'on',
    readOnly: false
  })
  bodyFromEditor.value = editor.getValue()
  editor.onDidChangeModelContent(() => {
    bodyFromEditor.value = editor?.getModel()?.getValue() ?? ''
  })
  await injectSystemInfo()
})

watch(submitting, (v) => {
  if (editor) editor.updateOptions({ readOnly: v })
})

watch(isDark, () => {
  if (editor) monaco.editor.setTheme(isDark.value ? 'vs-dark' : 'vs')
})
</script>

<style scoped>
.feedback-dialog :deep(.el-dialog) {
  border-radius: 16px;
  margin-top: 0;
}
.feedback-dialog :deep(.el-dialog__header) {
  padding: 16px 20px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}
.feedback-dialog :deep(.el-dialog__body) {
  padding: 16px 20px;
  max-height: 75vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
.user-feedback-view {
  display: flex;
  flex-direction: column;
  min-height: 0;
  flex: 1;
}
.feedback-form-scroll {
  flex: 1;
  min-height: 0;
  overflow: auto;
}
.feedback-form {
  min-height: 0;
}
.feedback-submit-bar {
  flex-shrink: 0;
  padding: 16px 0 0;
  border-top: 1px solid var(--el-border-color-lighter);
}
.monaco-editor-container {
  width: 100%;
  height: 320px;
  border: 1px solid var(--el-border-color);
  border-radius: 8px;
}
.attachments-area { width: 100%; }
.attachment-hint { font-size: 12px; color: var(--el-text-color-secondary); margin-top: 8px; }
.attachment-error { color: var(--el-color-danger); font-size: 12px; margin-top: 4px; }
.feedback-footer { margin-top: 24px; padding-top: 16px; border-top: 1px solid var(--el-border-color-lighter); font-size: 13px; color: var(--el-text-color-secondary); }
.footer-hint { margin-bottom: 8px; }
.footer-contact { margin-bottom: 4px; }
.footer-copy { cursor: pointer; text-decoration: underline; color: var(--el-color-primary); }
.footer-copy:hover { opacity: 0.85; }
.attachment-list { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 10px; }
.attachment-item {
  display: inline-flex; align-items: center; gap: 6px; padding: 6px 10px; border-radius: 6px;
  border: 1px solid var(--el-border-color); background: var(--el-fill-color-light); font-size: 13px;
}
.attachment-item.attachment-image { cursor: pointer; padding: 4px; }
.attachment-item.attachment-image:hover { border-color: var(--el-color-primary); }
.attachment-thumb { width: 48px; height: 48px; object-fit: cover; border-radius: 4px; display: block; }
.attachment-name { max-width: 120px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.attachment-preview-hint { font-size: 14px; color: var(--el-color-primary); margin-left: 4px; }
.attachment-remove { font-size: 16px; margin-left: 4px; cursor: pointer; color: var(--el-text-color-secondary); }
.attachment-remove:hover { color: var(--el-color-danger); }
.attachment-uploaded-check { font-size: 16px; margin-left: 4px; color: var(--el-color-success); }
.image-preview-dialog :deep(.el-dialog) { border-radius: 12px; }
</style>
