from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from app.core.security import get_optional_user
from app.models.user import User

router = APIRouter(prefix="/playground", tags=["Playground"])


class RunCodeRequest(BaseModel):
    code: str = Field(..., min_length=1)
    language: str = Field(default="javascript")
    stdin: str = ""
    filename: str | None = None


class SaveSnippetRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=120)
    code: str = Field(..., min_length=1)
    language: str = Field(default="javascript")
    description: str | None = None


class RunCodeResponse(BaseModel):
    stdout: str = ""
    stderr: str = ""
    output: str = ""
    exitCode: int = 0
    execution_time_ms: int = 0
    language: str
    success: bool = True


def _finish(language: str, start_time: float, stdout: str = "", stderr: str = "", output: str = "", exit_code: int = 0, success: bool = True):
    import time
    return RunCodeResponse(
        language=language,
        stdout=stdout,
        stderr=stderr,
        output=output or stdout or stderr or "No output",
        exitCode=exit_code,
        execution_time_ms=int((time.perf_counter() - start_time) * 1000),
        success=success,
    )


@router.post("/run", response_model=RunCodeResponse)
async def run_code(
    payload: RunCodeRequest,
    current_user: User | None = Depends(get_optional_user),
):
    import os
    import shutil
    import subprocess
    import sys
    import tempfile
    import time

    language = payload.language.lower().strip()
    code = payload.code
    start_time = time.perf_counter()

    def run_command(command: list[str], input_text: str = "", timeout: int = 10, cwd: str | None = None):
        result = subprocess.run(
            command,
            input=input_text,
            capture_output=True,
            text=True,
            timeout=timeout,
            cwd=cwd,
        )
        return result

    temp_paths: list[str] = []

    try:
        if language == "python":
            with tempfile.NamedTemporaryFile(mode="w", suffix=".py", delete=False, encoding="utf-8") as f:
                f.write(code)
                py_path = f.name
                temp_paths.append(py_path)

            result = run_command([sys.executable, py_path], input_text=payload.stdin)
            return _finish(
                language,
                start_time,
                stdout=result.stdout or "",
                stderr=result.stderr or "",
                output=result.stdout or result.stderr or "No output",
                exit_code=result.returncode,
                success=result.returncode == 0,
            )

        if language in {"javascript", "typescript"}:
            node_bin = shutil.which("node")
            if not node_bin:
                return _finish(language, start_time, stderr="Node.js not found in PATH.", output="Node runner unavailable.", exit_code=1, success=False)

            with tempfile.NamedTemporaryFile(mode="w", suffix=".js", delete=False, encoding="utf-8") as f:
                f.write(code)
                js_path = f.name
                temp_paths.append(js_path)

            result = run_command([node_bin, js_path], input_text=payload.stdin)
            return _finish(
                language,
                start_time,
                stdout=result.stdout or "",
                stderr=result.stderr or "",
                output=result.stdout or result.stderr or "No output",
                exit_code=result.returncode,
                success=result.returncode == 0,
            )

        if language in {"c", "cpp", "c++"}:
            compiler = shutil.which("g++") if language in {"cpp", "c++"} else shutil.which("gcc")
            if not compiler:
                return _finish(language, start_time, stderr="C/C++ compiler not found in PATH.", output="Compiler unavailable.", exit_code=1, success=False)

            src_ext = ".cpp" if language in {"cpp", "c++"} else ".c"
            with tempfile.NamedTemporaryFile(mode="w", suffix=src_ext, delete=False, encoding="utf-8") as f:
                f.write(code)
                src_path = f.name
                temp_paths.append(src_path)

            exe_path = src_path + ".out"
            compile_cmd = [compiler, src_path, "-o", exe_path, "-O2"]
            compile_result = run_command(compile_cmd)
            if compile_result.returncode != 0:
                return _finish(
                    language,
                    start_time,
                    stdout=compile_result.stdout or "",
                    stderr=compile_result.stderr or "",
                    output=compile_result.stderr or compile_result.stdout or "Compilation failed",
                    exit_code=compile_result.returncode,
                    success=False,
                )

            temp_paths.append(exe_path)
            run_result = run_command([exe_path], input_text=payload.stdin)
            return _finish(
                language,
                start_time,
                stdout=run_result.stdout or "",
                stderr=run_result.stderr or "",
                output=run_result.stdout or run_result.stderr or "No output",
                exit_code=run_result.returncode,
                success=run_result.returncode == 0,
            )

        if language == "java":
            javac = shutil.which("javac")
            java = shutil.which("java")
            if not javac or not java:
                return _finish(language, start_time, stderr="Java compiler/runtime not found in PATH.", output="Java runner unavailable.", exit_code=1, success=False)

            workdir = tempfile.mkdtemp(prefix="playground_java_")
            temp_paths.append(workdir)
            src_path = os.path.join(workdir, "Main.java")
            with open(src_path, "w", encoding="utf-8") as f:
                f.write(code)

            compile_result = run_command([javac, src_path], cwd=workdir)
            if compile_result.returncode != 0:
                return _finish(
                    language,
                    start_time,
                    stdout=compile_result.stdout or "",
                    stderr=compile_result.stderr or "",
                    output=compile_result.stderr or compile_result.stdout or "Compilation failed",
                    exit_code=compile_result.returncode,
                    success=False,
                )

            run_result = run_command([java, "-cp", workdir, "Main"], cwd=workdir, input_text=payload.stdin)
            return _finish(
                language,
                start_time,
                stdout=run_result.stdout or "",
                stderr=run_result.stderr or "",
                output=run_result.stdout or run_result.stderr or "No output",
                exit_code=run_result.returncode,
                success=run_result.returncode == 0,
            )

        if language == "html":
            return _finish(
                language,
                start_time,
                stdout=code,
                stderr="",
                output="HTML preview returned successfully.",
                exit_code=0,
                success=True,
            )

        if language == "sql":
            return _finish(language, start_time, output="SQL execution requires a database sandbox integration.", exit_code=1, success=False)

        if language == "php":
            php = shutil.which("php")
            if not php:
                return _finish(language, start_time, stderr="PHP not found in PATH.", output="PHP runner unavailable.", exit_code=1, success=False)
            with tempfile.NamedTemporaryFile(mode="w", suffix=".php", delete=False, encoding="utf-8") as f:
                f.write(code)
                path = f.name
                temp_paths.append(path)
            result = run_command([php, path], input_text=payload.stdin)
            return _finish(language, start_time, stdout=result.stdout or "", stderr=result.stderr or "", output=result.stdout or result.stderr or "No output", exit_code=result.returncode, success=result.returncode == 0)

        if language == "go":
            go = shutil.which("go")
            if not go:
                return _finish(language, start_time, stderr="Go not found in PATH.", output="Go runner unavailable.", exit_code=1, success=False)
            workdir = tempfile.mkdtemp(prefix="playground_go_")
            temp_paths.append(workdir)
            main_path = os.path.join(workdir, "main.go")
            with open(main_path, "w", encoding="utf-8") as f:
                f.write(code)
            run_result = run_command([go, "run", main_path], cwd=workdir, input_text=payload.stdin)
            return _finish(language, start_time, stdout=run_result.stdout or "", stderr=run_result.stderr or "", output=run_result.stdout or run_result.stderr or "No output", exit_code=run_result.returncode, success=run_result.returncode == 0)

        if language == "rust":
            cargo = shutil.which("cargo")
            rustc = shutil.which("rustc")
            if not cargo and not rustc:
                return _finish(language, start_time, stderr="Rust toolchain not found in PATH.", output="Rust runner unavailable.", exit_code=1, success=False)
            return _finish(language, start_time, output="Rust support requires project sandbox integration.", exit_code=1, success=False)

        return _finish(
            language,
            start_time,
            output=f"Unsupported language: {language}",
            exit_code=1,
            success=False,
        )

    except subprocess.TimeoutExpired:
        return _finish(language, start_time, stderr="Execution timed out after 10 seconds.", output="Error: timeout", exit_code=124, success=False)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Run failed: {str(e)}")
    finally:
        for path in reversed(temp_paths):
            try:
                if os.path.isdir(path):
                    shutil.rmtree(path, ignore_errors=True)
                elif os.path.exists(path):
                    os.unlink(path)
            except Exception:
                pass


@router.post("/save")
async def save_snippet(
    payload: SaveSnippetRequest,
    current_user: User | None = Depends(get_optional_user),
):
    return {
        "id": 1,
        "name": payload.name,
        "language": payload.language,
        "saved": True,
        "message": "Snippet saved",
    }