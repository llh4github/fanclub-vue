<script setup lang="ts">
import { ref } from "vue"
import { checkScBv } from "@/api/viewer"
import { isSuccess } from "@/api"
import { useDebounceFn, onClickOutside } from "@vueuse/core"
import type { ViewerScBvCheckResult } from "@/api/viewer"

const isExpanded = ref(false)
const bv = ref("")
const loading = ref(false)
const result = ref<ViewerScBvCheckResult | null>(null)
const errorMsg = ref("")
const showResult = ref(false)
const formRef = ref<HTMLElement | null>(null)

const toggleExpanded = () => {
  isExpanded.value = !isExpanded.value
  if (!isExpanded.value) {
    resetState()
  }
}

const resetState = () => {
  bv.value = ""
  result.value = null
  errorMsg.value = ""
  showResult.value = false
}

const handleQuery = async () => {
  if (!bv.value.trim()) {
    errorMsg.value = "请输入BV号"
    return
  }

  const bvPattern = /^BV[A-Za-z0-9]{10}$/i
  if (!bvPattern.test(bv.value.trim())) {
    errorMsg.value = "请输入正确的BV号"
    return
  }

  errorMsg.value = ""
  loading.value = true
  showResult.value = false

  try {
    const resp = await checkScBv(bv.value.trim())
    if (isSuccess(resp.code) && resp.data) {
      result.value = resp.data
      showResult.value = true
    } else {
      errorMsg.value = resp.msg || "查询失败"
    }
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "请求被取消") {
        return
      }
      errorMsg.value = "网络异常，请重试"
    } else {
      errorMsg.value = "查询失败，请重试"
    }
  } finally {
    loading.value = false
  }
}

const debouncedQuery = useDebounceFn(handleQuery, 300)

const closeForm = () => {
  if (isExpanded.value) {
    isExpanded.value = false
    resetState()
  }
}

const copyBv = async () => {
  if (!bv.value) return
  try {
    await navigator.clipboard.writeText(`点播 ${bv.value}`)
    const btn = document.querySelector(".copy-btn")
    if (btn) {
      btn.textContent = "已复制!"
      setTimeout(() => {
        if (btn) btn.textContent = `点播 ${bv.value}`
      }, 1500)
    }
  } catch {
    const input = document.createElement("input")
    input.value = bv.value
    document.body.appendChild(input)
    input.select()
    document.execCommand("copy")
    document.body.removeChild(input)
    const btn = document.querySelector(".copy-btn")
    if (btn) {
      btn.textContent = "已复制!"
      setTimeout(() => {
        if (btn) btn.textContent = `点播 ${bv.value}`
      }, 1500)
    }
  }
}

onClickOutside(formRef, closeForm)
</script>

<template>
  <div class="sc-bv-checker">
    <Transition name="fade-scale">
      <div v-if="isExpanded" ref="formRef" class="checker-form">
        <div class="form-header">
          <span class="form-title">🔍 SC点播查询</span>
          <button class="close-btn" @click="toggleExpanded">×</button>
        </div>

        <div class="form-content">
          <div class="input-group">
            <label class="input-label">BV号</label>
            <input v-model="bv" type="text" class="bv-input" :class="{ 'input-error': errorMsg }"
              placeholder="例如: BV1xK4y1b7NP" :disabled="loading" @keyup.enter="debouncedQuery" />
            <span v-if="errorMsg" class="error-text">{{ errorMsg }}</span>
          </div>

          <button class="query-btn" :disabled="loading || !bv.trim()" @click="debouncedQuery">
            <span v-if="loading" class="loading-spinner"></span>
            <span v-else>查询</span>
          </button>
        </div>

        <Transition name="slide-fade">
          <div v-if="showResult && result" class="result-area">
            <div v-if="result.exists" class="result-success">
              <span class="result-icon">✅</span>
              <span class="result-text">存在相关SC点播记录</span>
            </div>
            <div v-else class="result-empty">
              <span class="result-icon">📭</span>
              <span class="result-text">未找到相关SC点播记录</span>
            </div>
            <button class="copy-btn" @click="copyBv" v-if="bv">点播 {{ bv }}</button>
          </div>
        </Transition>
      </div>
    </Transition>

    <button class="float-btn" @click="toggleExpanded" :title="isExpanded ? '收起' : 'SC点播查询'">
      <span class="float-icon">🔍</span>
    </button>
  </div>
</template>

<style scoped>
.sc-bv-checker {
  position: fixed;
  bottom: 80px;
  right: 20px;
  z-index: 200;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 12px;
}

.float-btn {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: none;
  background: rgba(223, 118, 35, 0.15);
  backdrop-filter: blur(10px);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.float-btn:hover {
  background: rgba(223, 118, 35, 0.25);
  transform: scale(1.1);
  box-shadow: 0 6px 16px rgba(223, 118, 35, 0.3);
}

.float-icon {
  font-size: 1.2rem;
  line-height: 1;
}

.checker-form {
  width: 280px;
  background: rgba(15, 10, 26, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  border: 1px solid rgba(223, 118, 35, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  overflow: hidden;
}

.form-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  border-bottom: 1px solid rgba(223, 118, 35, 0.1);
}

.form-title {
  font-size: 0.9rem;
  color: rgba(196, 181, 253, 0.9);
  font-weight: 500;
}

.close-btn {
  width: 24px;
  height: 24px;
  border: none;
  background: rgba(255, 255, 255, 0.05);
  color: rgba(196, 181, 253, 0.5);
  font-size: 1.2rem;
  line-height: 1;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  background: rgba(223, 118, 35, 0.2);
  color: rgba(196, 181, 253, 0.9);
}

.form-content {
  padding: 16px;
}

.input-group {
  margin-bottom: 12px;
}

.input-label {
  display: block;
  font-size: 0.75rem;
  color: rgba(196, 181, 253, 0.6);
  margin-bottom: 6px;
}

.bv-input {
  width: 100%;
  padding: 10px 12px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(223, 118, 35, 0.15);
  border-radius: 8px;
  color: rgba(196, 181, 253, 0.9);
  font-size: 0.85rem;
  transition: all 0.2s ease;
  box-sizing: border-box;
}

.bv-input::placeholder {
  color: rgba(196, 181, 253, 0.3);
}

.bv-input:focus {
  outline: none;
  border-color: rgba(223, 118, 35, 0.4);
  background: rgba(255, 255, 255, 0.05);
}

.bv-input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.bv-input.input-error {
  border-color: rgba(255, 100, 100, 0.5);
}

.error-text {
  display: block;
  font-size: 0.7rem;
  color: rgba(255, 100, 100, 0.8);
  margin-top: 4px;
}

.query-btn {
  width: 100%;
  padding: 10px;
  background: rgba(223, 118, 35, 0.2);
  border: 1px solid rgba(223, 118, 35, 0.3);
  border-radius: 8px;
  color: rgba(196, 181, 253, 0.9);
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.query-btn:hover:not(:disabled) {
  background: rgba(223, 118, 35, 0.3);
  border-color: rgba(223, 118, 35, 0.5);
}

.query-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.loading-spinner {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(196, 181, 253, 0.3);
  border-top-color: rgba(196, 181, 253, 0.9);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.result-area {
  padding: 12px 16px;
  border-top: 1px solid rgba(223, 118, 35, 0.1);
}

.result-success,
.result-empty {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.8rem;
}

.result-success {
  color: rgba(100, 255, 150, 0.9);
}

.result-empty {
  color: rgba(196, 181, 253, 0.6);
}

.result-icon {
  font-size: 1rem;
  line-height: 1;
}

.result-text {
  line-height: 1.4;
}

.copy-btn {
  margin-top: 10px;
  width: 100%;
  padding: 8px 12px;
  background: rgba(223, 118, 35, 0.2);
  border: 1px solid rgba(223, 118, 35, 0.3);
  border-radius: 6px;
  color: rgba(196, 181, 253, 0.9);
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.copy-btn:hover {
  background: rgba(223, 118, 35, 0.3);
  border-color: rgba(223, 118, 35, 0.5);
}

.copy-btn:active {
  transform: scale(0.98);
}

/* 过渡动画 */
.fade-scale-enter-active,
.fade-scale-leave-active {
  transition: all 0.3s ease;
}

.fade-scale-enter-from,
.fade-scale-leave-to {
  opacity: 0;
  transform: scale(0.9) translateY(10px);
}

.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.2s ease;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  opacity: 0;
  transform: translateY(-5px);
}

/* 移动端适配 */
@media (max-width: 768px) {
  .sc-bv-checker {
    bottom: 90px;
    right: 16px;
  }

  .float-btn {
    width: 40px;
    height: 40px;
  }

  .float-icon {
    font-size: 1.1rem;
  }

  .checker-form {
    width: calc(100vw - 80px);
    max-width: 320px;
  }
}

@media (max-width: 480px) {
  .sc-bv-checker {
    bottom: 80px;
    right: 12px;
  }

  .float-btn {
    width: 38px;
    height: 38px;
  }

  .checker-form {
    width: calc(100vw - 60px);
  }
}
</style>
