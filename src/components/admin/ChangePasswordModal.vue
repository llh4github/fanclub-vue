<script setup lang="ts">
import { ref } from "vue"
import { NModal, NForm, NFormItem, NInput, NButton, NIcon, useMessage } from "naive-ui"
import { EyeOutline, EyeOffOutline } from "@vicons/ionicons5"
import { put } from "@/api/request"
import { isSuccess } from "@/api/types"
import { ensureKeyExchange, getSessionId, encryptWithAes } from "@/utils/crypto"
import { getUserId } from "@/utils/auth"

const props = defineProps<{
  show: boolean
}>()

const emit = defineEmits<{
  "update:show": [value: boolean]
}>()

const message = useMessage()
const isLoading = ref(false)
const showNewPassword = ref(false)
const showConfirmPassword = ref(false)

const formData = ref({
  newPassword: "",
  confirmPassword: "",
})

function closeModal() {
  emit("update:show", false)
  resetForm()
}

function resetForm() {
  formData.value = {
    newPassword: "",
    confirmPassword: "",
  }
}

async function handleSubmit() {
  if (!formData.value.newPassword) {
    message.warning("请输入新密码")
    return
  }

  if (formData.value.newPassword.length < 6) {
    message.warning("新密码长度不能少于6位")
    return
  }

  if (formData.value.newPassword !== formData.value.confirmPassword) {
    message.warning("两次输入的新密码不一致")
    return
  }

  isLoading.value = true

  try {
    const keyExchangeOk = await ensureKeyExchange()
    if (!keyExchangeOk) {
      message.error("加密通道初始化失败")
      return
    }

    const sessionId = getSessionId()
    const userId = getUserId()
    if (!sessionId || !userId) {
      message.error("会话已过期，请重新登录")
      return
    }

    const encryptedPassword = await encryptWithAes(formData.value.newPassword)

    const resp = await put("/user/password", {
      user_id: Number.parseInt(userId, 10),
      session_id: sessionId,
      new_password: encryptedPassword,
    })

    if (isSuccess(resp.code)) {
      message.success("密码修改成功")
      closeModal()
    } else {
      message.error(resp.msg || "密码修改失败")
    }
  } catch {
    message.error("密码修改失败，请稍后重试")
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <NModal
    :show="props.show"
    @update:show="emit('update:show', $event)"
    preset="card"
    title="修改密码"
    :style="{ width: '420px', maxWidth: '90vw' }"
    :bordered="false"
    :content-style="{
      background: 'rgba(26, 16, 24, 0.95)',
      borderRadius: '12px',
      border: '1px solid rgba(223, 118, 35, 0.3)',
    }"
    :header-style="{
      background: 'transparent',
      borderBottom: '1px solid rgba(223, 118, 35, 0.15)',
    }"
  >
    <NForm :model="formData" label-placement="top">
      <NFormItem label="新密码" path="newPassword">
        <NInput
          v-model:value="formData.newPassword"
          :type="showNewPassword ? 'text' : 'password'"
          show-password-on="click"
          placeholder="请输入新密码（至少6位）"
          :maxlength="60"
        >
          <template #suffix>
            <button
              type="button"
              class="password-toggle"
              @click="showNewPassword = !showNewPassword"
            >
              <NIcon>
                <EyeOutline v-if="!showNewPassword" />
                <EyeOffOutline v-else />
              </NIcon>
            </button>
          </template>
        </NInput>
      </NFormItem>

      <NFormItem label="确认新密码" path="confirmPassword">
        <NInput
          v-model:value="formData.confirmPassword"
          :type="showConfirmPassword ? 'text' : 'password'"
          show-password-on="click"
          placeholder="请再次输入新密码"
          :maxlength="60"
        >
          <template #suffix>
            <button
              type="button"
              class="password-toggle"
              @click="showConfirmPassword = !showConfirmPassword"
            >
              <NIcon>
                <EyeOutline v-if="!showConfirmPassword" />
                <EyeOffOutline v-else />
              </NIcon>
            </button>
          </template>
        </NInput>
      </NFormItem>
    </NForm>

    <template #footer>
      <div class="modal-footer">
        <NButton @click="closeModal" :disabled="isLoading">取消</NButton>
        <NButton type="primary" :loading="isLoading" @click="handleSubmit" class="submit-btn">
          确认修改
        </NButton>
      </div>
    </template>
  </NModal>
</template>

<style scoped>
.password-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.25rem;
  background: transparent;
  border: none;
  color: rgba(255, 228, 204, 0.5);
  cursor: pointer;
  transition: color 0.2s ease;
}

.password-toggle:hover {
  color: #ff9e5e;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}

.submit-btn {
  background: linear-gradient(135deg, #df7623 0%, #ff9e5e 100%);
  border: none;
}

.submit-btn:hover {
  box-shadow: 0 4px 16px rgba(223, 118, 35, 0.4);
}
</style>
