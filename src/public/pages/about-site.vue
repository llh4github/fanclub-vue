<template>
  <div class="min-h-screen bg-background text-foreground relative overflow-hidden">
    <Navigation />
    <main class="relative z-10 pt-20">
      <section class="py-20 px-4 sm:px-6 lg:px-8 relative">
        <div class="max-w-4xl mx-auto">
          <div class="text-center mb-12">
            <h2 class="text-3xl sm:text-4xl font-bold mb-4">
              <span class="text-[#DF7623]">关于</span>本站
            </h2>
            <div class="w-20 h-1 bg-[#DF7623] mx-auto"></div>
          </div>

          <div class="space-y-8">
            <!-- 站点介绍 -->
            <div class="bg-card border border-border p-6 rounded-lg">
              <h3 class="text-xl font-semibold mb-4 flex items-center gap-2">
                <Info class="w-5 h-5 text-[#DF7623]" />
                站点介绍
              </h3>
              <p class="text-muted-foreground leading-relaxed">
                本站是虚拟主播莉蔻（Liko）的非官方粉丝站，致力于收集和展示莉蔻的直播数据、精彩语录和成长历程。
                所有数据来源于公开渠道，仅供粉丝交流使用。
              </p>
            </div>
            <!-- 开源信息 -->
            <div class="bg-card border border-border p-6 rounded-lg">
              <h3 class="text-xl font-semibold mb-4 flex items-center gap-2">
                <Code class="w-5 h-5 text-[#DF7623]" />
                开源信息
              </h3>
              <p class="text-muted-foreground mb-4">
                本网站前后端代码采用 Apache License 开源协议，欢迎 Star 和贡献代码。
              </p>
              <div class="space-y-3">
                <a
                  href="https://github.com/llh4github/fanclub-apiserver"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="flex items-center gap-3 px-4 py-3 bg-[#DF7623]/10 border border-[#DF7623]/30 rounded hover:bg-[#DF7623]/20 transition-colors group"
                >
                  <div class="w-10 h-10 bg-background rounded flex items-center justify-center">
                    <svg class="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                      <path
                        d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"
                      />
                    </svg>
                  </div>
                  <div>
                    <div class="font-semibold group-hover:text-[#DF7623] transition-colors">
                      后端代码库
                    </div>
                    <div class="text-xs text-muted-foreground">llh4github/fanclub-apiserver</div>
                  </div>
                  <ExternalLink class="w-4 h-4 text-[#DF7623] ml-auto" />
                </a>
                <a
                  href="https://github.com/llh4github/fanclub-vue"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="flex items-center gap-3 px-4 py-3 bg-[#DF7623]/10 border border-[#DF7623]/30 rounded hover:bg-[#DF7623]/20 transition-colors group"
                >
                  <div class="w-10 h-10 bg-background rounded flex items-center justify-center">
                    <svg class="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                      <path
                        d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"
                      />
                    </svg>
                  </div>
                  <div>
                    <div class="font-semibold group-hover:text-[#DF7623] transition-colors">
                      前端代码库
                    </div>
                    <div class="text-xs text-muted-foreground">llh4github/fanclub-vue</div>
                  </div>
                  <ExternalLink class="w-4 h-4 text-[#DF7623] ml-auto" />
                </a>
              </div>
            </div>

            <!-- 数据来源 -->
            <div class="bg-card border border-border p-6 rounded-lg">
              <h3 class="text-xl font-semibold mb-4 flex items-center gap-2">
                <Database class="w-5 h-5 text-[#DF7623]" />
                数据来源
              </h3>
              <ul class="space-y-2 text-muted-foreground">
                <li class="flex items-center gap-2">
                  <span class="w-2 h-2 bg-[#DF7623] rounded-full"></span>
                  粉丝数据：Bilibili API
                </li>
                <li class="flex items-center gap-2">
                  <span class="w-2 h-2 bg-[#DF7623] rounded-full"></span>
                  直播时长：Bilibili 直播间数据
                </li>
                <li class="flex items-center gap-2">
                  <span class="w-2 h-2 bg-[#DF7623] rounded-full"></span>
                  语录收集：粉丝投稿整理
                </li>
              </ul>
            </div>

            <!-- 免责声明 -->
            <div class="bg-card border border-border p-6 rounded-lg">
              <h3 class="text-xl font-semibold mb-4 flex items-center gap-2">
                <Shield class="w-5 h-5 text-[#DF7623]" />
                免责声明
              </h3>
              <p class="text-muted-foreground leading-relaxed text-sm">
                本站为粉丝自发建设的非官方网站，与莉蔻本人及所属社团无任何关联。
                所有内容仅供娱乐交流，如有侵权或不当之处，请联系删除。
                本站不对数据的实时性和准确性做出任何保证。
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
    <Footer />
  </div>
</template>

<script setup lang="ts">
import Navigation from '../components/Navigation.vue'
import Footer from '../components/Footer.vue'
import { Info, Code, Database, Shield, Mail, ExternalLink } from 'lucide-vue-next'
</script>

<style scoped>
.bg-card {
  background-color: rgba(26, 26, 46, 0.8);
}
</style>
