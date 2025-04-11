"use strict";(self.webpackChunkneural_log_docs=self.webpackChunkneural_log_docs||[]).push([[768],{7704:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>c,contentTitle:()=>a,default:()=>u,frontMatter:()=>o,metadata:()=>i,toc:()=>h});const i=JSON.parse('{"id":"auth/overview","title":"Auth Overview","description":"The NeuralLog Auth service provides centralized authentication and authorization for all NeuralLog services using OpenFGA.","source":"@site/docs/auth/overview.md","sourceDirName":"auth","slug":"/auth/overview","permalink":"/docs/docs/auth/overview","draft":false,"unlisted":false,"editUrl":"https://github.com/NeuralLog/docs/tree/main/docs/auth/overview.md","tags":[],"version":"current","sidebarPosition":1,"frontMatter":{"sidebar_position":1},"sidebar":"tutorialSidebar","previous":{"title":"Quick Start Guide","permalink":"/docs/docs/getting-started/quick-start"},"next":{"title":"Server Overview","permalink":"/docs/docs/server/overview"}}');var r=n(4848),s=n(8453);const o={sidebar_position:1},a="Auth Overview",c={},h=[{value:"Features",id:"features",level:2},{value:"Architecture",id:"architecture",level:2},{value:"Key Components",id:"key-components",level:2},{value:"Auth API",id:"auth-api",level:3},{value:"Auth Core",id:"auth-core",level:3},{value:"OpenFGA",id:"openfga",level:3},{value:"Auth SDK",id:"auth-sdk",level:3},{value:"Getting Started",id:"getting-started",level:2},{value:"Security Considerations",id:"security-considerations",level:2}];function l(e){const t={code:"code",h1:"h1",h2:"h2",h3:"h3",header:"header",li:"li",p:"p",pre:"pre",strong:"strong",ul:"ul",...(0,s.R)(),...e.components};return(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)(t.header,{children:(0,r.jsx)(t.h1,{id:"auth-overview",children:"Auth Overview"})}),"\n",(0,r.jsx)(t.p,{children:"The NeuralLog Auth service provides centralized authentication and authorization for all NeuralLog services using OpenFGA."}),"\n",(0,r.jsx)(t.h2,{id:"features",children:"Features"}),"\n",(0,r.jsxs)(t.ul,{children:["\n",(0,r.jsxs)(t.li,{children:[(0,r.jsx)(t.strong,{children:"Multi-tenancy"}),": Support for multiple tenants with isolated data and configurations"]}),"\n",(0,r.jsxs)(t.li,{children:[(0,r.jsx)(t.strong,{children:"Fine-grained Authorization"}),": Detailed access control using OpenFGA"]}),"\n",(0,r.jsxs)(t.li,{children:[(0,r.jsx)(t.strong,{children:"Secure Authentication"}),": Industry-standard authentication mechanisms"]}),"\n",(0,r.jsxs)(t.li,{children:[(0,r.jsx)(t.strong,{children:"SDK Support"}),": Client libraries for various platforms"]}),"\n"]}),"\n",(0,r.jsx)(t.h2,{id:"architecture",children:"Architecture"}),"\n",(0,r.jsx)(t.p,{children:"The Auth service is built with a modular architecture that allows for flexibility and scalability:"}),"\n",(0,r.jsx)(t.pre,{children:(0,r.jsx)(t.code,{children:"\u250c\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2510     \u250c\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2510     \u250c\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2510\n\u2502             \u2502     \u2502             \u2502     \u2502             \u2502\n\u2502  Auth API   \u2502\u2500\u2500\u2500\u2500\u25b6\u2502  Auth Core  \u2502\u2500\u2500\u2500\u2500\u25b6\u2502   OpenFGA   \u2502\n\u2502             \u2502     \u2502             \u2502     \u2502             \u2502\n\u2514\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2518     \u2514\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2518     \u2514\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2518\n       \u2502                   \u2502                   \u2502\n       \u2502                   \u2502                   \u2502\n       \u25bc                   \u25bc                   \u25bc\n\u250c\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2510     \u250c\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2510     \u250c\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2510\n\u2502             \u2502     \u2502             \u2502     \u2502             \u2502\n\u2502  Auth SDK   \u2502     \u2502  Database   \u2502     \u2502 PostgreSQL  \u2502\n\u2502             \u2502     \u2502             \u2502     \u2502             \u2502\n\u2514\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2518     \u2514\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2518     \u2514\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2518\n"})}),"\n",(0,r.jsx)(t.h2,{id:"key-components",children:"Key Components"}),"\n",(0,r.jsx)(t.h3,{id:"auth-api",children:"Auth API"}),"\n",(0,r.jsx)(t.p,{children:"The Auth API provides RESTful endpoints for authentication, user management, and authorization."}),"\n",(0,r.jsx)(t.h3,{id:"auth-core",children:"Auth Core"}),"\n",(0,r.jsx)(t.p,{children:"The core business logic for the Auth service, handling authentication, authorization, and tenant management."}),"\n",(0,r.jsx)(t.h3,{id:"openfga",children:"OpenFGA"}),"\n",(0,r.jsx)(t.p,{children:"The authorization system that provides fine-grained access control."}),"\n",(0,r.jsx)(t.h3,{id:"auth-sdk",children:"Auth SDK"}),"\n",(0,r.jsx)(t.p,{children:"Client libraries for various platforms that simplify integration with the Auth service."}),"\n",(0,r.jsx)(t.h2,{id:"getting-started",children:"Getting Started"}),"\n",(0,r.jsx)(t.p,{children:"To get started with the Auth service, see the documentation in the Auth repository."}),"\n",(0,r.jsx)(t.h2,{id:"security-considerations",children:"Security Considerations"}),"\n",(0,r.jsx)(t.p,{children:"The Auth service is designed with security as a top priority."})]})}function u(e={}){const{wrapper:t}={...(0,s.R)(),...e.components};return t?(0,r.jsx)(t,{...e,children:(0,r.jsx)(l,{...e})}):l(e)}},8453:(e,t,n)=>{n.d(t,{R:()=>o,x:()=>a});var i=n(6540);const r={},s=i.createContext(r);function o(e){const t=i.useContext(s);return i.useMemo((function(){return"function"==typeof e?e(t):{...t,...e}}),[t,e])}function a(e){let t;return t=e.disableParentContext?"function"==typeof e.components?e.components(r):e.components||r:o(e.components),i.createElement(s.Provider,{value:t},e.children)}}}]);