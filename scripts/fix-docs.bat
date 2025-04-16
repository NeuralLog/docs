@echo off
REM fix-docs.bat - Wrapper for fix-docs.js
REM Usage: fix-docs.bat [repository-path] [options]

node "%~dp0fix-docs.js" %*
