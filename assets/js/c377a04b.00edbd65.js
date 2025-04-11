"use strict";(self.webpackChunkneural_log_docs=self.webpackChunkneural_log_docs||[]).push([[3361],{2502:(e,n,i)=>{i.r(n),i.d(n,{assets:()=>c,contentTitle:()=>l,default:()=>h,frontMatter:()=>o,metadata:()=>t,toc:()=>a});const t=JSON.parse('{"id":"index","title":"Introduction","description":"Welcome to the NeuralLog documentation! This guide will help you understand, set up, and use NeuralLog for logging and monitoring AI model interactions.","source":"@site/docs/index.md","sourceDirName":".","slug":"/","permalink":"/docs/docs/","draft":false,"unlisted":false,"editUrl":"https://github.com/NeuralLog/docs/tree/main/docs/index.md","tags":[],"version":"current","sidebarPosition":1,"frontMatter":{"sidebar_position":1}}');var r=i(4848),s=i(8453);const o={sidebar_position:1},l="Introduction",c={},a=[{value:"What is NeuralLog?",id:"what-is-neurallog",level:2},{value:"Key Features",id:"key-features",level:2},{value:"Components",id:"components",level:2},{value:"Getting Started",id:"getting-started",level:2},{value:"Architecture",id:"architecture",level:2},{value:"Repository Structure",id:"repository-structure",level:2},{value:"Contributing",id:"contributing",level:2},{value:"License",id:"license",level:2}];function d(e){const n={a:"a",code:"code",h1:"h1",h2:"h2",header:"header",li:"li",ol:"ol",p:"p",pre:"pre",strong:"strong",ul:"ul",...(0,s.R)(),...e.components};return(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)(n.header,{children:(0,r.jsx)(n.h1,{id:"introduction",children:"Introduction"})}),"\n",(0,r.jsx)(n.p,{children:"Welcome to the NeuralLog documentation! This guide will help you understand, set up, and use NeuralLog for logging and monitoring AI model interactions."}),"\n",(0,r.jsx)(n.h2,{id:"what-is-neurallog",children:"What is NeuralLog?"}),"\n",(0,r.jsx)(n.p,{children:"NeuralLog is a distributed system designed for logging and monitoring AI model interactions. It provides:"}),"\n",(0,r.jsxs)(n.ul,{children:["\n",(0,r.jsxs)(n.li,{children:[(0,r.jsx)(n.strong,{children:"Centralized Logging"}),": Store all AI model interactions in one place"]}),"\n",(0,r.jsxs)(n.li,{children:[(0,r.jsx)(n.strong,{children:"Structured Data"}),": Organize logs with structured data"]}),"\n",(0,r.jsxs)(n.li,{children:[(0,r.jsx)(n.strong,{children:"Search and Filtering"}),": Find specific logs quickly"]}),"\n",(0,r.jsxs)(n.li,{children:[(0,r.jsx)(n.strong,{children:"Statistics and Analytics"}),": Gain insights from log data"]}),"\n",(0,r.jsxs)(n.li,{children:[(0,r.jsx)(n.strong,{children:"Multi-tenancy"}),": Support multiple tenants with isolation"]}),"\n",(0,r.jsxs)(n.li,{children:[(0,r.jsx)(n.strong,{children:"Authentication and Authorization"}),": Secure access to logs"]}),"\n"]}),"\n",(0,r.jsx)(n.h2,{id:"key-features",children:"Key Features"}),"\n",(0,r.jsxs)(n.ul,{children:["\n",(0,r.jsxs)(n.li,{children:[(0,r.jsx)(n.strong,{children:"Multiple Storage Options"}),": Memory, NeDB, and Redis"]}),"\n",(0,r.jsxs)(n.li,{children:[(0,r.jsx)(n.strong,{children:"RESTful API"}),": Easy integration with any application"]}),"\n",(0,r.jsxs)(n.li,{children:[(0,r.jsx)(n.strong,{children:"TypeScript SDK"}),": Client library for TypeScript and JavaScript applications"]}),"\n",(0,r.jsxs)(n.li,{children:[(0,r.jsx)(n.strong,{children:"Web Dashboard"}),": Visualize logs and statistics"]}),"\n",(0,r.jsxs)(n.li,{children:[(0,r.jsx)(n.strong,{children:"Fine-grained Authorization"}),": Control access to logs"]}),"\n",(0,r.jsxs)(n.li,{children:[(0,r.jsx)(n.strong,{children:"Namespacing"}),": Isolate logs by tenant or environment"]}),"\n",(0,r.jsxs)(n.li,{children:[(0,r.jsx)(n.strong,{children:"Statistics"}),": Track usage patterns and performance"]}),"\n"]}),"\n",(0,r.jsx)(n.h2,{id:"components",children:"Components"}),"\n",(0,r.jsx)(n.p,{children:"NeuralLog consists of several independent components:"}),"\n",(0,r.jsxs)(n.ul,{children:["\n",(0,r.jsxs)(n.li,{children:[(0,r.jsx)(n.strong,{children:"Logs Server"}),": The central component that handles log storage, retrieval, and statistics"]}),"\n",(0,r.jsxs)(n.li,{children:[(0,r.jsx)(n.strong,{children:"Web Application"}),": The user interface for interacting with logs and visualizing statistics"]}),"\n",(0,r.jsxs)(n.li,{children:[(0,r.jsx)(n.strong,{children:"Auth Service"}),": Handles authentication and authorization for the system"]}),"\n",(0,r.jsxs)(n.li,{children:[(0,r.jsx)(n.strong,{children:"Shared Package"}),": Contains common types and utilities used across components"]}),"\n",(0,r.jsxs)(n.li,{children:[(0,r.jsx)(n.strong,{children:"TypeScript SDK"}),": Client library for interacting with the logs server from TypeScript and JavaScript applications"]}),"\n"]}),"\n",(0,r.jsx)(n.h2,{id:"getting-started",children:"Getting Started"}),"\n",(0,r.jsx)(n.p,{children:"To get started with NeuralLog, follow these guides:"}),"\n",(0,r.jsxs)(n.ol,{children:["\n",(0,r.jsxs)(n.li,{children:[(0,r.jsx)(n.a,{href:"./development/environment-setup.md",children:"Environment Setup"}),": Set up your development environment"]}),"\n",(0,r.jsxs)(n.li,{children:[(0,r.jsx)(n.a,{href:"/docs/docs/development/shared-package",children:"Shared Package Management"}),": Learn how to work with the shared package"]}),"\n",(0,r.jsxs)(n.li,{children:[(0,r.jsx)(n.a,{href:"/docs/docs/components/sdk",children:"TypeScript SDK"}),": Learn how to use the TypeScript SDK"]}),"\n",(0,r.jsxs)(n.li,{children:[(0,r.jsx)(n.a,{href:"./deployment/docker.md",children:"Docker Deployment"}),": Deploy NeuralLog using Docker"]}),"\n"]}),"\n",(0,r.jsx)(n.h2,{id:"architecture",children:"Architecture"}),"\n",(0,r.jsx)(n.p,{children:"NeuralLog follows a microservices architecture with the following components:"}),"\n",(0,r.jsx)(n.pre,{children:(0,r.jsx)(n.code,{className:"language-mermaid",children:"graph TD\n    Client[Client Application] --\x3e|Logs Data| LogsServer[Logs Server]\n    WebApp[Web Application] --\x3e|Fetch Logs| LogsServer\n    WebApp --\x3e|Auth Requests| AuthService[Auth Service]\n    LogsServer --\x3e|Store Data| Redis[(Redis)]\n    LogsServer --\x3e|Store Data| NeDB[(NeDB)]\n    LogsServer --\x3e|Store Data| Memory[(Memory)]\n    AuthService --\x3e|Store Auth Data| PostgreSQL[(PostgreSQL)]\n    AuthService --\x3e|Authorization| OpenFGA[OpenFGA]\n"})}),"\n",(0,r.jsxs)(n.p,{children:["For more details, see the ",(0,r.jsx)(n.a,{href:"./overview/architecture.md",children:"Architecture"})," page."]}),"\n",(0,r.jsx)(n.h2,{id:"repository-structure",children:"Repository Structure"}),"\n",(0,r.jsx)(n.p,{children:"NeuralLog is not a monorepo. Instead, it consists of several independent repositories:"}),"\n",(0,r.jsxs)(n.ul,{children:["\n",(0,r.jsxs)(n.li,{children:[(0,r.jsx)(n.strong,{children:"server"}),": The logs server implementation"]}),"\n",(0,r.jsxs)(n.li,{children:[(0,r.jsx)(n.strong,{children:"web"}),": The web application frontend"]}),"\n",(0,r.jsxs)(n.li,{children:[(0,r.jsx)(n.strong,{children:"auth"}),": The authentication and authorization service"]}),"\n",(0,r.jsxs)(n.li,{children:[(0,r.jsx)(n.strong,{children:"shared"}),": Common types and utilities"]}),"\n",(0,r.jsxs)(n.li,{children:[(0,r.jsx)(n.strong,{children:"specs"}),": Project specifications and GitHub issues"]}),"\n",(0,r.jsxs)(n.li,{children:[(0,r.jsx)(n.strong,{children:"docs"}),": Project documentation"]}),"\n",(0,r.jsxs)(n.li,{children:[(0,r.jsx)(n.strong,{children:"infra"}),": Infrastructure configuration"]}),"\n"]}),"\n",(0,r.jsxs)(n.p,{children:["For more details on managing these repositories, see the ",(0,r.jsx)(n.a,{href:"./repository-management.md",children:"Repository Management"})," page."]}),"\n",(0,r.jsx)(n.h2,{id:"contributing",children:"Contributing"}),"\n",(0,r.jsx)(n.p,{children:"We welcome contributions to NeuralLog! To contribute:"}),"\n",(0,r.jsxs)(n.ol,{children:["\n",(0,r.jsx)(n.li,{children:"Fork the relevant repository"}),"\n",(0,r.jsx)(n.li,{children:"Create a feature branch"}),"\n",(0,r.jsx)(n.li,{children:"Make your changes"}),"\n",(0,r.jsx)(n.li,{children:"Submit a pull request"}),"\n"]}),"\n",(0,r.jsx)(n.p,{children:"Please follow the coding standards and write tests for your changes."}),"\n",(0,r.jsx)(n.h2,{id:"license",children:"License"}),"\n",(0,r.jsx)(n.p,{children:"NeuralLog is licensed under the ISC License. See the LICENSE file in each repository for details."})]})}function h(e={}){const{wrapper:n}={...(0,s.R)(),...e.components};return n?(0,r.jsx)(n,{...e,children:(0,r.jsx)(d,{...e})}):d(e)}},8453:(e,n,i)=>{i.d(n,{R:()=>o,x:()=>l});var t=i(6540);const r={},s=t.createContext(r);function o(e){const n=t.useContext(s);return t.useMemo((function(){return"function"==typeof e?e(n):{...n,...e}}),[n,e])}function l(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(r):e.components||r:o(e.components),t.createElement(s.Provider,{value:n},e.children)}}}]);