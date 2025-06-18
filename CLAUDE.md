# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

このプロジェクトは、Claude DesktopがGrowiと対話するためのMCP (Model Context Protocol) サーバーです。TypeScriptで記述され、@modelcontextprotocol/sdk v1.12.3を使用してGrovi APIとの統合を提供します。

## 開発コマンド

### ビルドとテスト
- `npm run build` - TypeScriptをコンパイルしてdist/フォルダに出力、実行可能ファイルに権限を設定
- `npm run watch` - TypeScriptを監視モードでコンパイル
- `npm test` - Jest でテストを実行
- `npm run test:watch` - Jest を監視モードで実行

### 単一テスト実行
```bash
# 特定のテストファイルを実行
npm test -- src/tools/create-page.test.ts

# テスト名を指定して実行
npm test -- --testNamePattern="should create page successfully"
```

## コードアーキテクチャ

### モジュール構成
- **src/index.ts** - MCPサーバーのエントリーポイント、StdioServerTransportで実行
- **src/server.ts** - McpServerインスタンスの作成とZodスキーマベースのツール登録
- **src/config/** - 環境変数からの設定読み込み (GROWI_API_URL, GROWI_API_TOKEN)
- **src/api/** - Growi APIクライアント、axios使用、認証トークン自動付与
- **src/tools/** - 5つのMCPツール実装（従来形式）とその定義
- **src/utils/** - 型ガードとユーティリティ関数
- **src/types/** - TypeScript型定義

### MCP SDK統合パターン
- **McpServer**: 高レベルMCP SDK APIを使用、ツール登録を簡素化
- **Zodスキーマ**: パラメータ検証と型安全性のため各ツールにZodスキーマを定義
- **CallToolResult変換**: 従来のツールハンドラー戻り値をMCP CallToolResult形式に変換
- **型安全性**: TypeScriptとZodによる完全な型検証

### MCPツール一覧
1. `growi_list_pages` - ページ一覧取得 (limit?: number, path?: string)  
2. `growi_get_page` - 特定ページ取得 (path: string)
3. `growi_create_page` - 新規ページ作成 (path: string, body: string)
4. `growi_update_page` - ページ更新 (path: string, body: string)
5. `growi_search_pages` - ページ検索 (q: string, limit?: number, offset?: number)

### API通信パターン
- `ApiClient`クラスがaxiosインスタンスを管理
- リクエストインターセプターでaccess_tokenを自動付与
- 各ツールハンドラーが型安全な引数検証を実行
- `callTool`関数で従来形式からCallToolResult形式への変換を実行

### テスト構成
- 各モジュールに対応する.test.tsファイルを配置
- Jest + ts-jest でESMモジュール対応
- APIクライアント、ツールハンドラー、ユーティリティの単体テスト
- moduleNameMapperでESM import拡張子の調整

### 技術仕様
- **Node.js**: >= 18 (MCP SDK要件)
- **TypeScript**: ^5.8.3 (ESMモジュール)
- **MCP SDK**: @modelcontextprotocol/sdk v1.12.3
- **HTTP クライアント**: axios v1.8.4
- **スキーマ検証**: zod (MCP SDK内蔵)

### 環境設定要件
MCPサーバー実行には以下の環境変数が必須:
- `GROWI_API_URL` - GrowiインスタンスのURL
- `GROWI_API_TOKEN` - Growi APIアクセストークン

### Claude Code設定コマンド
MCPサーバーの追加（プロジェクトスコープ推奨）:
```bash
claude mcp add --scope project growi node /path/to/growi-mcp/dist/index.js \
  --env GROWI_API_URL=https://your-growi-instance.com \
  --env GROWI_API_TOKEN=your_api_token_here
```

管理コマンド:
- `claude mcp list` - サーバー一覧表示
- `claude mcp get growi` - サーバー詳細表示  
- `claude mcp remove growi` - サーバー削除

### 重要な実装詳細
- StdioServerTransportを使用してClaude Desktop/Codeとの標準入出力通信
- 従来のツールハンドラーとMCP CallToolResult間の適合レイヤー
- エラーハンドリングはisErrorフラグ付きでMCP準拠形式に変換
- Claude Codeでは`claude mcp add`コマンドによる動的設定が可能

## MCPサーバーテスト状況

### 実行済みテスト (2025-06-18)
- ✅ **ページ一覧取得** (`growi_list_pages`): 正常動作
  - 10件のページが正常に取得できることを確認
  - 技術書類、プロジェクト関連のページが表示される
- ✅ **特定ページ取得** (`growi_get_page`): 正常動作
  - `/技術書類/GROWI/GROWI MCP` ページの内容が正常に取得できることを確認
- ✅ **ページ更新** (`growi_update_page`): 正常動作
  - `/技術書類/GROWI/GROWI MCP` ページの更新が成功
- ❌ **ページ検索** (`growi_search_pages`): 認証エラー
  - GrowiのAPIからHTMLログインページが返される
  - 認証トークンまたはAPIエンドポイントの設定に問題の可能性
  - Unity、Discord、GROWIキーワードでの検索すべてで同じエラー

### 現在のMCP設定
- APIエンドポイント: `https://growi.zequt.com`
- 認証: APIトークン設定済み
- スコープ: プロジェクト (.mcp.json)

### 既知の問題
- 検索機能のみ認証エラーが発生
- 他のAPI機能（一覧取得、ページ取得）は正常動作
- 問題は検索API特有の認証要件またはGrowiインスタンス設定の可能性