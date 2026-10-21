"""Use the original GGS read-only server, with RubberQ business configuration."""
from pathlib import Path
import runpy
import sys

base = Path(__file__).resolve().parents[1]
root = base.parents[2]
ggs = root.parent.parent / '全球增长系统复用/skills/ggs-content-production-dashboard/scripts/dashboard.py'
if not ggs.is_file():
    raise SystemExit('找不到GGS原程序，请在本机恢复原包路径；不要复制业务状态建立第二套服务。')
sys.argv = [str(ggs), 'serve', '--config', str(base / 'project-config.json'), *sys.argv[1:]]
runpy.run_path(str(ggs), run_name='__main__')
